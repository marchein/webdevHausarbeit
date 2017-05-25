var map = require("leaflet"); // add library for the map
var functions = require("./function.js"); // add other functions
document.querySelector("head").innerHTML += "<link rel='stylesheet' href='http://cdn.leafletjs.com/leaflet-0.7.3/leaflet.css' />"; // add css for the map
document.querySelector("head").innerHTML += "<link rel='stylesheet' href='https://fonts.googleapis.com/css?family=Open+Sans'>"; // add css for fonts

let allTracks = []; // datastructure for the trackdata

let content = document.getElementById("content"); // find content container
let mapArea = document.createElement("div"); //create map area
mapArea.id = "mapArea";
content.appendChild(mapArea);

let trackArea = document.createElement("div"); // create right pane
trackArea.id = "trackArea";
content.appendChild(trackArea);

let controls = document.createElement("div"); // create control section
controls.id = "controls";
trackArea.appendChild(controls);

// todo - add div for the tracks


var mapView = map.map("mapArea").setView([49.749992, 6.6371433], 13); // set map to trier and current zoom = 13

map.tileLayer("https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token={accessToken}", {
	attribution: 'Map data &copy; <a href="http://openstreetmap.org">OpenStreetMap</a> contributors, <a href="http://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, Imagery © <a href="http://mapbox.com">Mapbox</a>',
	maxZoom: 18,
	id: "mapbox.streets",
	accessToken: "pk.eyJ1IjoibWFyY2hlaW4iLCJhIjoiY2ozNHF6bm9tMDAyajJ3cDdjYWQ5N3QydCJ9.I5KDSfeFcn6e2oUJi6k2fg"
}).addTo(mapView);

functions.loadFile("http://localhost:8080/api/alltracks", init); // load all tracks and call init()

function init() {
	allTracks = JSON.parse(this.responseText); // parse response
	for (let i = 0; i < allTracks.length; i++) {
		addTracksToList(allTracks[i].features[0].properties.name, i); // add every track to the list
	}
}

function addTracksToList(name, id) {
	let trackButton = document.createElement("span"); // create track element
	trackButton.innerHTML = name; // set name
	trackButton.className = "trackButton"; // set class
	trackButton.id = id; // set id to it's own id (this is == the id in the api)
	trackArea.appendChild(trackButton); // add to the list
	trackButton.addEventListener("click", loadSelectedTrack, false); // on click load infomation of the track
}

function loadSelectedTrack(event) {
	let id = event.target.id; // get id from <span id="THIS IS THIS ID">
	functions.loadFile("http://localhost:8080/api/track/" + id, highlightSelectedTrack); // load from the api
}

function highlightSelectedTrack() {
	let selectedTrack = JSON.parse(this.responseText); // get answer from api
	console.log(selectedTrack.features[0].properties.name); // output the name of the response

	var style = {
		color: "#ff0000",
		weight: 5
	};

	map.geoJSON(selectedTrack, {
		style: style
	}).addTo(mapView);
}
