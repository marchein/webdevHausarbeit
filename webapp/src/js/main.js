var map = require("leaflet"); // add library for the map
var functions = require("./function.js"); // add other functions
document.querySelector("head").innerHTML += "<link rel='stylesheet' href='http://cdn.leafletjs.com/leaflet-0.7.3/leaflet.css' />"; // add css for the map
document.querySelector("head").innerHTML += "<link rel='stylesheet' href='https://fonts.googleapis.com/css?family=Open+Sans'>"; // add css for fonts

let allTracks = []; // datastructure for the trackdata

let serverPath = document.URL;

let content = document.getElementById("content"); // find content container
let mapContainer = document.createElement("div"); //create map area
mapContainer.id = "mapContainer";
content.appendChild(mapContainer);

let mapArea = document.createElement("div"); //create map area
mapArea.id = "mapArea";
mapContainer.appendChild(mapArea);

let heightArea = document.createElement("div"); //create map area
heightArea.id = "heightArea";
mapContainer.appendChild(heightArea);

let trackArea = document.createElement("div"); // create right pane
trackArea.id = "trackArea";
content.appendChild(trackArea);

let controls = document.createElement("div"); // create control section
controls.id = "controls";
trackArea.appendChild(controls);

let tracks = document.createElement("div"); // create control section
tracks.id = "tracks";
trackArea.appendChild(tracks);

var mapView = map.map("mapArea").setView([49.749992, 6.6371433], 13); // set map to trier and current zoom = 13

map.tileLayer("https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token={accessToken}", {
	attribution: 'Map data &copy; <a href="http://openstreetmap.org">OpenStreetMap</a> contributors, <a href="http://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, Imagery © <a href="http://mapbox.com">Mapbox</a>',
	maxZoom: 18,
	id: "mapbox.streets",
	accessToken: "pk.eyJ1IjoibWFyY2hlaW4iLCJhIjoiY2ozNHF6bm9tMDAyajJ3cDdjYWQ5N3QydCJ9.I5KDSfeFcn6e2oUJi6k2fg"
}).addTo(mapView);

functions.loadFile(serverPath + "api/tracks", init); // load all tracks and call init()

function init() {
	allTracks = JSON.parse(this.responseText); // parse response
	for (let i = 0; i < allTracks.length; i++) {
		addTracksToList(allTracks[i].features[0].properties.name, i); // add every track to the list
	}
	initCanvas();
}

function addTracksToList(name, id) {
	let trackButton = document.createElement("span"); // create track element
	trackButton.innerHTML = name; // set name
	trackButton.className = "trackButton"; // set class
	trackButton.id = id; // set id to it's own id (this is == the id in the api)
	tracks.appendChild(trackButton); // add to the list
	trackButton.addEventListener("click", loadSelectedTrack, false); // on click load infomation of the track
}

function loadSelectedTrack(event) {
	var elements = document.querySelectorAll(".trackButton.active");

	[].forEach.call(elements, function (element) {
		element.classList.remove("active");
	});

	event.target.className += " active";
	let id = event.target.id; // get id from <span id="THIS IS THIS ID">
	highlightSelectedTrack(id);
	//functions.loadFile(serverPath + "api/tracks/" + id, highlightSelectedTrack); // load from the api
}

let mapLayer;

function highlightSelectedTrack(id) {
	if (mapLayer !== undefined) {
		mapView.removeLayer(mapLayer);
	}
	addCanvas();
	//let selectedTrack = JSON.parse(this.responseText); // get answer from api
	let selectedTrack = allTracks[id];
	// console.log(selectedTrack.features[0].geometry.coordinates); // output the name of the response
	var style = {
		color: "#ff0000",
		weight: 5
	};

	mapLayer = map.geoJSON(selectedTrack, {
		style: style
	});

	let coordinates = selectedTrack.features[0].geometry.coordinates;
	addMarkers(coordinates);
	drawHeight(coordinates);

	mapView.fitBounds(mapLayer.getBounds());
	mapLayer.addTo(mapView);
}

function addMarkers(coordinates) {
	if (mapLayer !== undefined) {
		let greenIcon = new map.Icon({
			iconUrl: "https://cdn.rawgit.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-green.png",
			shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png",
			iconSize: [25, 41],
			iconAnchor: [12, 41],
			popupAnchor: [1, -34],
			shadowSize: [41, 41]
		});

		let redIcon = new map.Icon({
			iconUrl: "https://cdn.rawgit.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-red.png",
			shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png",
			iconSize: [25, 41],
			iconAnchor: [12, 41],
			popupAnchor: [1, -34],
			shadowSize: [41, 41]
		});

		map.marker([coordinates[0][1], coordinates[0][0]], { icon: redIcon }).addTo(mapLayer);
		map.marker([coordinates[coordinates.length - 1][1], coordinates[coordinates.length - 1][0]], { icon: greenIcon }).addTo(mapLayer);
	}
}

function addCanvas() {
	let heightCanvas = document.createElement("canvas"); //create map area
	heightCanvas.id = "heightCanvas";
	heightArea.appendChild(heightCanvas);

	let trackInfos = document.createElement("div"); //create map area
	trackInfos.id = "trackInfos";
	heightArea.appendChild(trackInfos);
}

function drawHeight(coordinates) {
	let canvas = document.getElementById("heightCanvas");

	let heightPoints = [];

	for (let i = 0; i < coordinates.length; i++) {
		console.log(coordinates[i][2]);
		heightPoints.push(coordinates[i][2]);
	}
}

function initCanvas() {
	heightArea.innerHTML = "Bitte Track auswählen";
}
