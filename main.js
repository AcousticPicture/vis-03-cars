// Good-to-know
// https://hackernoon.com/understanding-map-filter-and-reduce-in-javascript-5df1c7eee464


// Fields
let content = '';
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
	console.log(data);
    readTextFile();

    initialize();	// resize canvas and draw
})

function initialize() {
	var clientWidth = document.getElementById('canvaswrapper').clientWidth;
	var wrapper = document.getElementById('canvaswrapper');
	}

// Reading File
function readXMLHttpRequest() 
{
    var rawFile = new XMLHttpRequest();
     rawFile.open("GET", file_path, false);
     rawFile.onreadystatechange = function () {
         if(rawFile.readyState === 4) {
             if(rawFile.status === 200 || rawFile.status == 0) {
                content = rawFile.responseText;
             }
         }
     }
     rawFile.send(null);
}

// Reading File
// TODO: Read from Input-File
function readTextFile() {
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
	
	readXMLHttpRequest();
	// --- Reading data to objects ---

	// split to get only lines
	var lines = content.split("\n")

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
				line['Year'] = "19".concat(columns[key]);
			} else {
				let str = columns[key];
				if (typeof str === 'undefined') {
					str = '';
				}
				str = str.replace('\r','');
				str = str.replace(',','.');
				str = toUpper(str);
				let str2 = Number(str)
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

