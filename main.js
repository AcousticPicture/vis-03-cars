// Good-to-know
// https://hackernoon.com/understanding-map-filter-and-reduce-in-javascript-5df1c7eee464


// Fields
let data = []
const file_path = "cars2.txt"

var shapes = [];  // the collection of car boxes

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
}
// color shade picker
// https://www.tutorialrepublic.com/html-reference/html-color-picker.php

// Main Function
// if window loaded, start JS
window.addEventListener('load', event => {
    console.log('Start');
    readTextFile();

    initialize();	// resize canvas and draw
})

function initialize() {
	var clientWidth = document.getElementById('canvaswrapper').clientWidth;
	var wrapper = document.getElementById('canvaswrapper');
	   // Register an event listener to call the resizeCanvas() function 
	   // each time the window is resized.
	   window.addEventListener('resize', resizeCanvas, false);
	   // Draw canvas border for the first time.
	   resizeCanvas();
	}
// Runs each time the DOM window resize event fires.
// Resets the canvas dimensions to match window,
// then draws the new borders accordingly.
function resizeCanvas() {
	let clientWidth = document.getElementById('canvaswrapper').clientWidth;
	width = clientWidth;
	height = width / 1.5;
	canvas.width = width;
	canvas.height = height;
	chartwidth = width / 6 * 5;
	chartheight = height * 0.75;
	can_margin = height - chartheight;
	col_margin = chartheight / 17;
	col_width = chartwidth / 34;
	draw();
}		

canvas.addEventListener('click', function(e) {
	const mPos = getMousePos(e);
	for (let c = 0; c < shapes.length; c++) {
		let shape = shapes[c];
		if (isSelected(mPos, shapes[c])) {
			document.querySelector('#accTitle').innerHTML = shape.name;
			var n = document.getElementById("ac-container");
			while (n.childElementCount > 0) {
				n.removeChild(n.lastChild);
			}

			for (let i = 0; i < shape.cars.length; i++) {
				let radioHtml = '<input type="radio" name="accordion-1" id="ac-' + (i+1) + '"';
				radioHtml += '>';
				radioHtml += '<label for="ac-' + (i+1) + '">' + shape.cars[i].Car + '</label></input>';

				let cardiv = document.createElement('DIV');
				cardiv.innerHTML = radioHtml;	// input and label
				
				let listHtml = '<ul><li>Cylinders: ' + shape.cars[i].Cylinders + '</li>';
				listHtml += '<li>Displacement: ' + parseFloat(shape.cars[i].Displacement2).toFixed(2) + ' ccm</li>';
				listHtml += '<li>Consumption: ' + parseFloat(shape.cars[i].Reach).toFixed(1) + ' l</li>';
				listHtml += '<li>Horsepower: ' + shape.cars[i].Horsepower + ' PS</li>';
				listHtml += '<li>Acceleration: ' + shape.cars[i].Acceleration + ' s</li>';
				listHtml += '<li>Weight: ' + parseFloat(shape.cars[i].WeightKG).toFixed(0) + ' kg</li>';
				listHtml += '</ul>';
				let art = document.createElement("ARTICLE");
				art.innerHTML = listHtml;
				art.classList.add("ac-medium");
				cardiv.appendChild(art);
				
				let test = document.getElementById("ac-container");
				test.appendChild(cardiv);
			}
		}
	}
  }, true);
  
function getMousePos(evt) {
	var rect = canvas.getBoundingClientRect();
	return {
		x: evt.clientX - rect.left,
		y: evt.clientY - rect.top
	};
}

// Everything for drawing will be called here
function draw() {
	ctx.clearRect(0, 0, canvas.width, canvas.height);	
    draw_grid()
    draw_manufacturer()
    draw_color_map()
	draw_cars()
}

function draw_grid() {
    // ctx.font = "30px Arial"
	ctx.fillStyle = colors.black
	ctx.lineWidth = '1';
	ctx.strokeStyle = colors.light_grey
	binheight = chartheight / 60;
    let margin = binheight * 10;
    for (let i = 0; i < 7; i ++){
        // biggest value is just under 60 and we want a line every 10 values (starting with 0)
        let y = height - can_margin - (i * margin)
		ctx.fillText(i * 10 ,0, y)
        ctx.beginPath();
        ctx.moveTo(10,y);
        ctx.lineTo(chartwidth - 10,y);
        ctx.stroke();
    }
}


function draw_manufacturer(){
    offset = 0;
	let tst = groupBy(data, "Origin");
	
	// for each region...
	for (let a=0; a < tst.length; a++) {
		let orig = tst[a].key;
		let cnt = tst[a].values.length;
		let mans = groupBy(tst[a].values, "Manufacturer");
		
		ctx.save() // save current context properties before rotating
		ctx.rotate(- Math.PI/2); // rotate context for vertical text
		ctx.font = "15px Arial"
		ctx.textAlign = "right";
		
		// for each manufacturer (in that region)...
		for(let i = 0; i < mans.length; i ++) {
			let man = mans[i].key;
			let cars = mans[i].values;
			ctx.fillText(man, -height + can_margin - 10, a * col_margin + col_margin + offset + i * col_width);
			//           Name                 x                     y
			saveShapes(man, cars, offset / col_width + i, a);
		}
		let localOffset = mans.length * col_width;
		offset += localOffset;
		
		ctx.restore()
	
		// --- Writing Origins ---
		ctx.font = "20px Raleway"
		ctx.textAlign = "center"
		ctx.fillText(orig, a * col_margin + (offset - localOffset/2) , height - 50)
		ctx.fillStyle = colors.dark_grey
		ctx.fillText(cnt, a * col_margin + (offset - localOffset/2) , height - 20)
	}

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


function saveShapes(man, cars, i, regionindex) {
	
	let y = chartheight;
	let years4 = groupBy(cars, "Year");
	let amount = 0;
	
	for (let a=0; a < years4.length; a++) {
		let jahr = years4[a].key;
		let cnt = years4[a].values.length;
		let h = cnt * binheight;
		y -= h;
		shapes.push(new Shape(regionindex * col_margin + i * col_width + 2 + 11, y, col_width-4, h, colors[jahr], man + ' ' + jahr, years4[a].values));
		amount += cnt;
	}
	return amount;
}

function draw_cars(){
	for (s=0; s < shapes.length; s++) {
		shapes[s].draw();
	}
}

function draw_color_map() {
	let squ_size = chartheight / 27;
    var x_val = chartwidth + col_margin
    var count = 0
    ctx.textAlign = "left"


    for(i = 1982; i > 1969; i--) {
        ctx.fillStyle = colors[i]
        ctx.fillRect(x_val, squ_size + squ_size * (count*2), squ_size, squ_size)
        ctx.fillStyle = colors.black
        ctx.fillText( String(i), x_val + squ_size + col_margin/2, (squ_size + squ_size) + (2 * squ_size) * count - 3)
        count ++
    }
}

// Reading File
function readTextFile()
{
	var toUpper = function(str) {
		return str
			.toLowerCase()
			.split(' ')
			.map(function(word) {
				return word.substr(0,1).toUpperCase() + word.substr(1);
			})
			.join(' ');
	}	
	let data_head = [];
    var rawFile = new XMLHttpRequest();
     rawFile.open("GET", file_path, false);
     rawFile.onreadystatechange = function () {
         if(rawFile.readyState === 4) {
             if(rawFile.status === 200 || rawFile.status == 0) {
                var content = rawFile.responseText;
                // --- Reading data to objects ---

                // split to get only lines
                var lines = content.split("\n")

				data_head =  lines[0].replace('\t\r','').split('\t')

                for(i = 1; i < lines.length; i ++){
                    // prepare object
                    var line = {}
                    // split line from tabs
                    var columns =  lines[i].split('\t')
                    for(key = 0; key < data_head.length; key ++){
                        // setting up map
						if (data_head[key] == "Model Year") {
							line['Year'] = "19".concat(columns[key].replace('\r',''));
						} else {
							var str = columns[key];
							if (typeof str === 'undefined') {
								str = '';
							}
							str = str.replace('\r','');
							str = str.replace(',','.');
							str = toUpper(str);
							str2 = Number(str)
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
             }
         }
     }
     rawFile.send(null);
}

function isSelected(point, shape) {
	let deltaX = (shape.x + shape.w) - point.x;
	let inWidth = ((deltaX >= 0) && (deltaX <= shape.w));
	let deltaY = (shape.y + shape.h) - point.y;
	let inHeight = ((deltaY >= 0) && (deltaY <= shape.h));
	return inWidth && inHeight;
}

// see: https://simonsarris.com/making-html5-canvas-useful/
// Constructor for Shape objects to hold data for all drawn objects.
// For now they will just be defined as rectangles.
function Shape(x, y, w, h, fill, name, cars) {
  // This is a very simple and unsafe constructor. 
  // All we're doing is checking if the values exist.
  // "x || 0" just means "if there is a value for x, use that. Otherwise use 0."
  this.x = x || 0;
  this.y = y || 0;
  this.w = w || 1;
  this.h = h || 1;
  this.fill = fill || '#AAAAAA';
  this.name = name || '';
  this.cars = cars || [];
}

// Draws this shape to a given context
Shape.prototype.draw = function() {
  ctx.fillStyle = this.fill;
  ctx.fillRect(this.x, this.y, this.w, this.h);
}

