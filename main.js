// Good-to-know
// https://hackernoon.com/understanding-map-filter-and-reduce-in-javascript-5df1c7eee464


// Fields
let content = '';
let data_head = []
let data = []

var shapes = [];  // the collection of car boxes

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
	var clientWidth = document.getElementById('canvaswrapper').clientWidth;
	var wrapper = document.getElementById('canvaswrapper');
	
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

				data_head =  lines[0].replace('\t\r','').split('\t')

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
							}
						}
					}
					// conversions
					line['WeightKG'] = line['Weight'] * 0.4536;	// weight in kg
					line['Displacement2'] = line['Displacement'] * 16.387;	// displacement in ccm
					line['Reach'] = 100 * 3.785 / (1.609 * line['MPG'])	// liters per 100km
					data.push(line)
				}
				
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
	// Adding select Options to axis-controls

	var x_axis = document.getElementById("x_axis");
	var y_axis = document.getElementById("y_axis");
	for (i = 0; i < data_head.length; i ++) {
		var option = document.createElement("option");
		option.text = data_head[i];
		x_axis.add(option, x_axis[i]);
		//TODO: How to copy object?
		var option = document.createElement("option");
		option.text = data_head[i];
		y_axis.add(option, y_axis[i]);
	}
	
	var sh = document.getElementById("shapes");
	var car_options = document.getElementById("cars");

	var cars = data.map((car, index, data) => {
		return car.Car
	})
	for (i = 0; i < cars.length; i ++) {
		var option = document.createElement("option");
		option.text = cars[i];
		car_options.add(option, car_options[i]);
	}

	var color_options = document.getElementById("colors");
	
	x_axis.addEventListener("change", draw)
	y_axis.addEventListener("change", draw)
	sh.addEventListener("change", draw)
	car_options.addEventListener("change", draw)
	color_options.addEventListener("change", draw)
}

function draw() {
	var x_axis = document.getElementById("x_axis");
	x_axis = x_axis.options[x_axis.selectedIndex].value
	var y_axis = document.getElementById("y_axis");
	y_axis = y_axis.options[y_axis.selectedIndex].value
	var sh = document.getElementById("shapes");
	sh = sh.options[sh.selectedIndex].value
	var car_option = document.getElementById("cars");
	car_option = car_option.options[car_option.selectedIndex].value
	var color_option = document.getElementById("colors");
	color_option = color_option.options[color_option.selectedIndex].value
	// let fords = data.filter((car) => {
	// 	return car.Manufacturer == "Ford"
	// })
	manus = []
	datasets = []
	for (i = 0; i < data.length; i++) {
		if (sh == 1) {
			shape = pointStyles[data[i].Origin]
			rad = 3
		} else if (sh == 2 && data[i].Car == car_option){
			shape = 'rectRot'
			rad = 10
		} else {
			shape = 'circle'
			rad = 3
		}
		if (color_option == 1) {
			col = colors[data[i].Manufacturer]
		} else if (color_option == 2 ){
			col = colors[data[i].Origin]
		} else if (color_option == 3 ){
			col = colors[data[i].Year]
		} else {
			col = 'rgba(0,0,0,0.1)'
		}

		manus[i] = data[i].Manufacturer
		datasets[i] = {
						data: [{x: data[i][x_axis], y: data[i][y_axis]}],
						pointStyle: shape,
						radius: rad,
						backgroundColor: col
					}
		//console.log(fords[i])
	}
	scatterChart = new Chart(ctx, {
		type: 'scatter',
		data: {
			manu: manus,
			labels: data.map((car, index, data) => {
				return car.Car
			}),
			datasets: datasets,
		},
		options: {
			legend: {
				display: false,
			},
			tooltips: {
				callbacks: {
				   label: function(tooltipItem, data) {
						var label = data.manu[tooltipItem.datasetIndex];
					  	var car_label = data.labels[tooltipItem.datasetIndex];
					    return car_label + " | " + label + ': (' + tooltipItem.xLabel + ', ' + tooltipItem.yLabel + ')';
				   }
				}
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