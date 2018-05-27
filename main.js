// Good-to-know
// https://hackernoon.com/understanding-map-filter-and-reduce-in-javascript-5df1c7eee464


// Fields
let data = []
const data_head = ["Car	Manufacturer", "MPG", "Cylinders", "Displacement", "Horsepower", "Weight", "Acceleration", "Model", "Year", "Origin"]
const file_path = "cars.txt"

// Main Function
// if window loaded, start JS 
window.addEventListener('load', event => {
    console.log('Start')
    readTextFile()
    console.log(data[10])
})

// Reading File
function readTextFile()
{   
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
                for(i = 0; i < lines.length; i ++){
                    // prepare object
                    line = {}
                    // split line from tabs
                    coloumns =  lines[i].split('\t')
                    for(key = 0; key < data_head.length; key ++){
                        // setting up map
                        line[data_head[key]] = coloumns[key]
                    }
                    data.push(line)
                }
             }
         }
     }     
     rawFile.send(null); 
}

