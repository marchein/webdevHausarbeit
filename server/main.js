var express = require("express");
var app = express();
let expressPort = process.argv[2];
const fs = require("fs");
let bikeData = [];
let path = "server/data/"; // set path where data files are stored

app.use(express.static("dist"));

// eslint-disable-next-line
var router = express.Router(); // init the url for the api
app.use("/api", router);

router.get("/", function (req, res) {
	let version = "<h1>Bike API v0.0.1</h1>\nWritten by Marc Hein";
	let usage = "\n\n<h2>Usage:</h2>\n<ul>\n\t<li>/ - this help page</li>\n\t<li>/tracks/ - get all tracks in json format</li>\n\t<li>/tracks/:id - get the track with the id of :id</li>\n</ul>";
	res.send(version + usage);
});

router.get("/tracks", function (req, res) {
	var json = JSON.stringify(bikeData);
	res.send(json);
});

router.get("/tracks/:id", function (req, res) {
	let id = req.params.id;
	let message;
	if (bikeData[id] !== undefined) {
		message = JSON.stringify(bikeData[id]);
	}
	else {
		message = { error: "Element not found!" };
	}
	res.send(message);
});

// Handle 404 error.
app.use("*", function (req, res) {
	res.status(404).send("<h1>Error 404 - not found"); // not found error
});

function fileExists(fileName) {
	let files = fs.readdirSync(path); // get list of all files
	return files.includes(fileName + ".json");
}

function initData() {
	try {
		let files = fs.readdirSync(path); // get list of all files
		for (let i = 0; i <= files.length; i++) {
			let currentFile = (i + 1); 	// current file name
			if (fileExists(currentFile)) { // check if the current file exists in the data set
				let currentDataInJSON = fs.readFileSync(path + currentFile + ".json"); // read the current file
				let currentData = JSON.parse(currentDataInJSON.toString()); // parse the file from json
				bikeData.push(currentData); // push data of the file into the data array
			}
		}
		bikeData.sort(function (a, b) {
			return a.features[0].properties.name.localeCompare(b.features[0].properties.name);
		});
	}
	catch (error) {
		console.error(error);
	}
}

app.listen(expressPort, function () {
	initData();
	console.log("Server running on: http://localhost:" + expressPort);
});
