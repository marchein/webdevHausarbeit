var express = require("express");
var app = express();
let expressPort = 8080;
const fs = require("fs");
let bikeData = [];
let path = "server/data/"; // set path where data files are stored

app.use(express.static("dist"));

// eslint-disable-next-line
var router = express.Router(); // init the url for the api
app.use("/api", router);

router.get("/", function (req, res) {
	let version = "<h1>Bike API v0.0.1</h1>\nWritten by Marc Hein & Konstantin Twardzik";
	let usage = "\n\n<h2>Usage:</h2>\n<ul>\n\t<li>/tracks - get all tracks in json format</li>\n\t<li>/track/:id get the track with the id of :id</li>\n</ul>";
	res.send(version + usage);
});

router.get("/alltracks", function (req, res) {
	var json = JSON.stringify(bikeData);
	res.send(json);
});

router.get("/track/:id", function (req, res) {
	let id = req.params.id;
	let message;
	if (fileExists(id)) {
		message = JSON.stringify(bikeData[id]);
	}
	else {
		message = { error: "Element not found!" };
	}
	res.send(message);
});

// Handle 404 error.
app.use("*", function (req, res) {
	res.status(404).send("404"); // not found error
});

function fileExists(fileName) {
	let files = fs.readdirSync(path); // get list of all files
	if (files.includes(fileName + ".json")) {
		return true;
	}
	return false;
}

function initData() {
	try {
		let files = fs.readdirSync(path); // get list of all files
		for (let i = 1; i < files.length; i++) {
			let currentFile = i; // current file name
			if (fileExists(currentFile)) { // check if the current file exists in the data set
				let currentDataInJSON = fs.readFileSync(path + currentFile + ".json"); // read the current file
				let currentData = JSON.parse(currentDataInJSON.toString()); // parse the file from json
				bikeData.push(currentData); // push data of the file into the data array
				//let obj = JSON.parse(data.toString());
				//bikeData.push(obj);
				//console.log(bikeData[i].features[0].properties.name);
			}
		}
	}
	catch (error) {
		console.error(error);
	}
}

app.listen(expressPort, function () {
	initData();
	console.log("Server running on: http://localhost:" + expressPort);
});
