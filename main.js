// Good-to-know
// https://hackernoon.com/understanding-map-filter-and-reduce-in-javascript-5df1c7eee464


// Fields
let data = []
//const data_head = ["Car", "Manufacturer", "MPG", "Cylinders", "Displacement", "Horsepower", "Weight", "Acceleration", "Year", "Origin"]
const file_path = "cars2.txt"

let american = []
let european = []
let japanese = []
let coord = []

const canvas = document.getElementById('canvas')
const ctx = canvas.getContext('2d')
const width = 820
const height = 600
const can_margin = 200

const col_width = 25
const col_margin = 20

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
    console.log('Start')
    readTextFile()
    store_manufacturer()

    draw()
})

// Everything for drawing will be called here
function draw() {
    draw_grid()
    draw_manufacturer()
    draw_color_map()
	draw_cars()
}

function draw_grid() {
    // ctx.font = "30px Arial"
    var margin = ((height - can_margin) / 10) * 2
    for (i = 0; i < 10; i ++){
        ctx.fillStyle = colors.black
        // 60 px for 8 cars
        var y = height - (i * margin)
        ctx.fillText((i * margin) / 10 ,0, y)
        ctx.strokeStyle = colors.light_grey
        ctx.beginPath();
        ctx.moveTo(0,y);
        ctx.lineTo(width,y);
        ctx.stroke();
    }
}

function toUpper(str) {
	return str
		.toLowerCase()
		.split(' ')
		.map(function(word) {
			return word[0].toUpperCase() + word.substr(1);
		})
		.join(' ');
}

function draw_manufacturer(){
    ctx.save() // save current context properties before rotating
    ctx.rotate(- Math.PI/2); // rotate context for vertical text
    ctx.font = "15px Arial"
	ctx.textAlign = "right";

    //coord = new Array(american.length + european.length + japanese.length);

    for(i = 0; i < american.length; i ++) {
       ctx.fillText(american[i], -width + can_margin - 10, col_margin + i * col_width);
       //           Name                 x                     y
        coord[american[i]] = new Array(2)
        coord[american[i]]['x'] = col_margin + i * col_width
        coord[american[i]]['car'] = []
		// coord['Chevrolet'] = {'x' => 35, 'car' => {}}
    }
    a_length = american.length * col_width

    for(i = 0; i < european.length; i ++) {
        ctx.fillText(european[i], -width + can_margin - 10, 2 * col_margin + a_length + i * col_width);
        coord[european[i]] = new Array(2);
        coord[european[i]]['x'] = 2 * col_margin + a_length + i * col_width;
        coord[european[i]]['car'] = [];
    }

    e_length = european.length * col_width

    for(i = 0; i < japanese.length; i ++) {
        ctx.fillText(japanese[i], - width + can_margin - 10, 3 * col_margin + a_length + e_length + i * col_width);
        coord[japanese[i]] = new Array(2)
        coord[japanese[i]]['x'] = 3 * col_margin + a_length + e_length + i * col_width;
        coord[japanese[i]]['car'] = []
    }

    j_length = japanese.length * col_width

    ctx.restore()
    // --- Writing Origins ---
    ctx.font = "20px Raleway"
    ctx.textAlign = "center"
    ctx.fillText("American", a_length/2 , height + 120)
    ctx.fillStyle = colors.dark_grey

    var amount = data.filter((car) => { // get only american cars
        return String(car.Origin).replace(/\s+/, "")  === "American"
    }).length
    ctx.fillText(amount, a_length/2 , height + 150)

    ctx.fillStyle = colors.black
    ctx.fillText("European", e_length/2 + col_margin + a_length, height + 120)
    ctx.fillStyle = colors.dark_grey

    var amount = data.filter((car) => { // get only european cars
        return String(car.Origin).replace(/\s+/, "")  === "European"
    }).length
    ctx.fillText(amount, e_length/2 + col_margin + a_length, height + 150)

    ctx.fillStyle = colors.black
    ctx.fillText("Japanese", j_length/2 + 2 * col_margin + a_length + e_length, height + 120)
    ctx.fillStyle = colors.dark_grey

    var amount = data.filter((car) => { // get only japanese cars
        return String(car.Origin).replace(/\s+/, "")  === "Japanese"
    }).length
    ctx.fillText(amount, j_length/2 + 2 * col_margin + a_length + e_length, height + 150)

}

function draw_cars(){
	
}

function draw_color_map() {
    var squ_size = 15
    var x_val = width + col_margin
    var count = 0
    ctx.textAlign = "left"


    for(i = 1982; i > 1969; i--) {
        ctx.fillStyle = colors[i]
        ctx.fillRect(x_val, col_margin + (2 * col_margin) * count, squ_size, squ_size)
        ctx.fillStyle = colors.black
        ctx.fillText( String(i), x_val + squ_size + col_margin/2, (col_margin + col_margin/2) + (2 * col_margin) * count)
        count ++
    }
}

// Reading File
function readTextFile()
{
	let data_head = [];
    var rawFile = new XMLHttpRequest();
     rawFile.open("GET", file_path, false);
     rawFile.onreadystatechange = function ()
     {
         if(rawFile.readyState === 4)
         {
             if(rawFile.status === 200 || rawFile.status == 0)
             {
                var content = rawFile.responseText;
                // --- Reading data to objects ---

                // split to get only lines
                var lines = content.split("\n")

				data_head =  lines[0].replace('\t\r','').split('\t')

                for(i = 1; i < lines.length; i ++){
                    // prepare object
                    var line = {}
                    // split line from tabs
                    columns =  lines[i].split('\t')
                    for(key = 0; key < data_head.length; key ++){
                        // setting up map
						if (data_head[key] == "Model Year") {
							line['Year'] = "19".concat(columns[key].replace('\r',''));
						} else {
							str = columns[key].replace('\r','').replace(',','.');
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

function store_manufacturer() {
    american = data.filter((car) => { // get only american cars
        return String(car.Origin).replace(/\s+/, "")  === "American"
    }).map((car) => { // get only manufacuter
        return car.Manufacturer
    }).filter(function (value, index, self) { // only unique
        return self.indexOf(value) === index;
    })

    european = data.filter((car) => { // get only european cars
        return String(car.Origin).replace(/\s+/, "")  === "European"
    }).map((car) => { // get only manufacuter
        return car.Manufacturer
    }).filter(function (value, index, self) { // only unique
        return self.indexOf(value) === index;
    })

    japanese = data.filter((car) => { // get only european cars
        return String(car.Origin).replace(/\s+/, "")  === "Japanese"
    }).map((car) => { // get only manufacuter
        return car.Manufacturer
    }).filter(function (value, index, self) { // only unique
        return self.indexOf(value) === index;
    })
}
