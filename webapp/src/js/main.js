var map = require("leaflet");
var functions = require("./function.js");
document.querySelector("head").innerHTML += "<link rel='stylesheet' href='http://cdn.leafletjs.com/leaflet-0.7.3/leaflet.css' />";
document.querySelector("head").innerHTML += "<link rel='stylesheet' href='https://fonts.googleapis.com/css?family=Open+Sans'>";

let allTracks = [];

let content = document.getElementById("content");
let mapArea = document.createElement("div");
mapArea.id = "mapArea";
content.appendChild(mapArea);

let trackArea = document.createElement("div");
trackArea.id = "trackArea";
content.appendChild(trackArea);

let controls = document.createElement("div");
controls.id = "controls";
trackArea.appendChild(controls);


var mapView = map.map("mapArea").setView([49.749992, 6.6371433], 13);

map.tileLayer("https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token={accessToken}", {
	attribution: 'Map data &copy; <a href="http://openstreetmap.org">OpenStreetMap</a> contributors, <a href="http://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, Imagery © <a href="http://mapbox.com">Mapbox</a>',
	maxZoom: 18,
	id: "mapbox.streets",
	accessToken: "pk.eyJ1IjoibWFyY2hlaW4iLCJhIjoiY2ozNHF6bm9tMDAyajJ3cDdjYWQ5N3QydCJ9.I5KDSfeFcn6e2oUJi6k2fg"
}).addTo(mapView);

functions.loadFile("http://localhost:8080/api/alltracks", init);

function init() {
	allTracks = JSON.parse(this.responseText);
	for (let i = 0; i < allTracks.length; i++) {
		addTracksToList(allTracks[i].features[0].properties.name, i);
	}
}

function addTracksToList(name, id) {
	let trackButton = document.createElement("span");
	trackButton.innerHTML = name;
	trackButton.className = "trackButton";
	trackButton.id = id;
	trackArea.appendChild(trackButton);
	trackButton.addEventListener("click", loadSelectedTrack, false);


	console.log('------------------------------------');
	console.log(name + " -- " + id);
	console.log('------------------------------------');
}

function loadSelectedTrack(event) {
	let id = event.target.id + 1;
	functions.loadFile("http://localhost:8080/api/track/" + id, highlightSelectedTrack);
}

function highlightSelectedTrack() {
	let selectedTrack = JSON.parse(this.responseText);
	console.log(selectedTrack);
}
