// Good-to-know
// https://hackernoon.com/understanding-map-filter-and-reduce-in-javascript-5df1c7eee464


// Fields
let content = '';
let data_head = []
let data_head_num = {}
let data = []
let years = []

var vis = false;
const canvas = document.getElementById('canvas')
const ctx = canvas.getContext('2d')
var width = 820
var height = 600
var can_margin = 200
var chartwidth = 675;
var chartheight = 450;
var binheight = chartheight / 60;	// margin for single block (1 car)

var col_width = 25
var col_margin = 20

const x_axis = document.getElementById("x_axis");
const y_axis = document.getElementById("y_axis");
const sh = document.getElementById("shapes");
const car_options = document.getElementById("cars");
const color_options = document.getElementById("colors");

const colors = {
    light_grey: '#ddd',
    dark_grey: '#555',
    black: '#000',
    1982: '#013941',
    1981: '#014851',
    1980: '#015661',
    1979: '#026472',
    1978: '#027382',
    1977: '#028192',
    1976: '#0390A3',
    1975: '#0390A3',
    1974: '#1C9BAC',
    1973: '#35A6B5',
    1972: '#4EB1BE',
    1971: '#67BCC7',
	1970: '#81C7D1',
	American: 'rgba(68, 104, 23, 0.5)',
	European: 'rgba(85, 53, 152, 0.5)',
	Japanese: 'rgba(222, 141, 61, 0.5)',
}

const pointStyles = {
	American: 'triangle',
	European: 'rect',
	Japanese: 'circle'
}
// color shade picker
// https://www.tutorialrepublic.com/html-reference/html-color-picker.php

// Main Function
// if window loaded, start JS
window.addEventListener('load', event => {
	console.log('Start');
    initialize();	// resize canvas and draw
})

function initialize() {
	x_axis.addEventListener("change", draw)
	y_axis.addEventListener("change", draw)
	sh.addEventListener("change", draw)
	car_options.addEventListener("change", draw)
	color_options.addEventListener("change", draw)
	
	// Setup the dnd listeners.
	document.getElementById('drop_zone').addEventListener('dragover', handleDragOver, false);
	document.getElementById('drop_zone').addEventListener('drop', handleFileDrop, false);
	document.getElementById('files').addEventListener('change', handleFileSelect, false);
	document.getElementById('canvaswrapper').style.visibility='hidden';
	document.getElementById('controlls').style.visibility='hidden';
	}

// Reading File -> is called every time a new file is selected
function handleFileSelect(evt) {
	var files = evt.target.files; // FileList object
	if (files.length > 0) {
		// there is only one file
		var f = files[0];
		readTextFile(f);
		
		if (!vis) {	// first file: show chart
			vis = true;
			document.getElementById('canvaswrapper').style.visibility='visible' ;
			document.getElementById('controlls').style.visibility='visible' ;
		}
	}
}

function handleFileDrop(evt) {
	evt.stopPropagation();
    evt.preventDefault();
	
	var files = evt.dataTransfer.files; // FileList object
	if (files.length > 0) {
		var f = files[0];
		readTextFile(f);
		
		if (!vis) {	// first file: show chart
			vis = true;
			document.getElementById('canvaswrapper').style.visibility='visible' ;
			document.getElementById('controlls').style.visibility='visible' ;
		}
	}
}
  
 
function readTextFile(f) {
	// --- Reading data to objects ---
		
	var toUpper = function(str) {
		return str
			.toLowerCase()
			.split(' ')
			.map(function(word) {
				return word.substr(0,1).toUpperCase() + word.substr(1);
			})
			.join(' ');
	}
		
	// clear all variables
	content = '';
	data_head = [];
	data_head_num = {};
	data = [];

	var reader = new FileReader();

		// Closure to capture the file information.
		reader.onload = (function(theFile) {
			return function(e) {
				// callback function (asynchronous!) -> is called, when results have arrived
				console.log("load file: " + escape(theFile.name));
				content = e.target.result;
				document.getElementById('headline').innerHTML = 'Data: ' + escape(theFile.name);
				
				// split to get only lines
				var lines = content.split("\n")
				console.log(lines);

				data_head =  lines[0].replace('\n','').replace('\t\t\r','').replace('\t\r','').split('\t');

				for(i = 1; i < lines.length; i ++){
					// prepare object
					let line = {}
					// split line from tabs
					let columns =  lines[i].replace('\t\r','').split('\t');
					if (columns.length == 1 && columns[0] == '') continue;	// ignore empty lines
					
					for(key = 0; key < data_head.length; key ++){
						// setting up map
						if (data_head[key] == "Model Year") {
							line['Year'] = parseInt("19".concat(columns[key]));
							//line['Year'] = "19".concat(columns[key]);
							data_head_num['Year'] = 1;
						} else {
							let str = columns[key];
							if (typeof str === 'undefined') {
								str = '';
							}
							str = str.replace('\r','');
							str = str.replace(',','.');
							str = toUpper(str);
							let str2 = Number(str)
							// TODO: NA-Behandlung
							if (isNaN(str2)) {
								line[data_head[key]] = String(str);
							} else {
								line[data_head[key]] = str2;
								data_head_num[data_head[key]] = 1;
							}
						}
					}

					data.push(line)
				}
				
				years = data.map((car) => { // get only Year
							return car.Year
						}).filter(function (value, index, self) { // only unique
							return self.indexOf(value) === index;
						});
				updateChart();
			};
		})(f);	// end of callback function

		// Read in the file as a string.
		reader.readAsText(f);
}

function updateChart() {
	setupControlls();
	generateRandomManuColors();
	draw();
}

function setupControlls(){
	// clear all dropdown lists
	x_axis.innerHTML = "";
	y_axis.innerHTML = "";
	car_options.innerHTML = "";
	
	// Adding select Options to dropdown lists
	i = 0;
	for (var key in data_head_num) {
		// Use the Option constructor: args text, value, defaultSelected, selected
		x_axis.appendChild(new Option(key, x_axis[i++]));
	}
	y_axis.innerHTML = x_axis.innerHTML;	// just copy options
	y_axis.selectedIndex = x_axis.selectedIndex + 1;

	var cars = data.map((car, index, data) => {
		return car.Car
	})
	for (i = 0; i < cars.length; i ++) {
		car_options.appendChild(new Option(cars[i], car_options[i]));
	}
	var op = new Option("ALL", "", true, true);
	car_options.appendChild(op);
}

function draw() {
	var x_val = x_axis.options[x_axis.selectedIndex].value
	var y_val = y_axis.options[y_axis.selectedIndex].value
	var sh_val = Number(sh.options[sh.selectedIndex].value)
	var car_val = car_options.options[car_options.selectedIndex].value
	var color_val = color_options.options[color_options.selectedIndex].value

	// if there is a filter, reduce data!
	var ds = data;
	if (car_val != '') {
		ds = data.filter((car) => {
			return car.Car == car_val;
		});
	}
	
	// group data (color)
	let grp_data = groupBy(ds, color_val);
	
	var datasets = []
	for (let i = 0; i < grp_data.length; i++) {
		var col = colors[grp_data[i].key];
		if (typeof col == 'undefined') 
			col = 'rgba(0,0,0,0.1)';
		shape = 'circle';
		rad = 6;
		
		var d = [];
		for (let k = 0; k < grp_data[i].values.length; k++) {
			d[k] = {x: grp_data[i].values[k][x_val], y: grp_data[i].values[k][y_val]};
			
		} // end for values
		datasets[i] = {
				label: grp_data[i].key,
				data: d,
				pointStyle: shape,
				radius: rad,
				backgroundColor: col
			}
	}	// end for group
	
	var manus = ds.map((car) => {return car.Manufacturer});
	var cars = ds.map((car) => {return car.Car});
	var labels = ds.map((car) => {return car[color_val]});
	
	var dat = {
			manu: manus,
			car: cars,
			lab: labels,
			datasets: datasets,
		};
	var x = [{
			display: true,
			scaleLabel: {
				display: true,
				labelString: x_val
			}
		}];
	var y = [{
			display: true,
			scaleLabel: {
				display: true,
				labelString: y_val
			}
		}];
		
	if (x_val == 'Year') {
		dat['xLabels'] = years;
		x[0]['type'] = 'category';
		
	} else if (y_val == 'Year') {
		dat['yLabels'] = years;
		y[0]['type'] = 'category';
		y[0]['position'] = 'left';
		y[0]['ticks'] = {reverse: true};
	}
				
	scatterChart = new Chart(ctx, {
		type: 'scatter',
		data: dat,
		options: {
			legend: {
				display: true,
				reverse: true,
				position: 'right'
			},
			tooltips: {
				mode: 'point',
				intersect: true,
				callbacks: {
					title: function(a, d) {
						return x_val + ': ' + a[0].xLabel + ', ' + y_val + ': ' + a[0].yLabel;
					},
					label: function(tooltipItem, d) {
						var mlabel = d.manu[tooltipItem.datasetIndex];
						var clabel = d.car[tooltipItem.datasetIndex];
					  	//var car_label = d.labels[tooltipItem.datasetIndex];
						if (color_val == 'None') {
							return mlabel + ' ' + clabel;
						} else {
							var color_label = d.lab[tooltipItem.datasetIndex];
							return color_label + " | " + mlabel + ' ' + clabel;
						}
				   }
				}		
			},
			responsive: true,
			scales: {
				xAxes: x,
				yAxes: y
			}
		}
	})
}

function generateRandomManuColors() {
	var manus = data.map((car, index, data) => {
		return car.Manufacturer
	})
	for (i = 0; i < manus.length; i++){
		colors[manus[i]] = random_rgba()
	}
}

function random_rgba() {
    var o = Math.round, r = Math.random, s = 255;
    return 'rgba(' + o(r()*s) + ',' + o(r()*s) + ',' + o(r()*s) + ',' + '0.5' + ')';
}

function handleDragOver(evt) {
    evt.stopPropagation();
    evt.preventDefault();
    evt.dataTransfer.dropEffect = 'copy'; // Explicitly show this is a copy.
  }

function groupBy(xs, key) { 
	return xs.reduce(function (rv, x) { 
		let v = key instanceof Function ? key(x) : x[key]; 
		let el = rv.find((r) => r && r.key === v); 
		if (el) { el.values.push(x); } 
		else { rv.push({ key: v, values: [x] }); } 
		return rv; }, 
	[]); 
}