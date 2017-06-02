let map = require("leaflet"); // add library for the map
let functions = require("./function.js"); // add other functions
document.querySelector("head").innerHTML += "<link rel='stylesheet' href='http://cdn.leafletjs.com/leaflet-0.7.3/leaflet.css' />"; // add css for the map
document.querySelector("head").innerHTML += "<link rel='stylesheet' href='https://maxcdn.bootstrapcdn.com/font-awesome/4.7.0/css/font-awesome.min.css'>"; // add css for fonts

let allTracks = []; // datastructure for the trackdata

let serverPath = document.URL;

let profileCanvas;
let profileContainer;

let maxItemsOnCurrentPage;

let currentFirstItem = 0;
let currentPage = 1;
let totalPages = 1;

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

let tracks = document.createElement("div"); // create control section
tracks.id = "tracks";
trackArea.appendChild(tracks);

let mapView = map.map("mapArea"); // set map to trier and current zoom = 13

function initMapView() {
	mapView.setView([49.749992, 6.6371433], 13);
}

map.tileLayer("https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token={accessToken}", {
	attribution: 'Map data &copy; <a href="http://openstreetmap.org">OpenStreetMap</a>',
	maxZoom: 18,
	id: "mapbox.streets",
	accessToken: "pk.eyJ1IjoibWFyY2hlaW4iLCJhIjoiY2ozNHF6bm9tMDAyajJ3cDdjYWQ5N3QydCJ9.I5KDSfeFcn6e2oUJi6k2fg"
}).addTo(mapView);

function init() {
	allTracks = JSON.parse(this.responseText); // parse response
	/*for (let i = 0; i < allTracks.length; i++) {
		addTracksToList(allTracks[i].features[0].properties.name, i); // add every track to the list
	}*/

	window.addEventListener("resize", windowResize);
	addControls();
	let left = document.getElementById("leftArrow");
	let right = document.getElementById("rightArrow");
	left.addEventListener("click", backPage, true);
	right.addEventListener("click", nextPage, true);
	setCurrentPage();
	initMapView();
}

functions.loadFile(serverPath + "api/tracks", init); // load all tracks and call init()

let mapLayer;

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
	if (profileCanvas !== undefined) {
		profileContainer.removeChild(profileCanvas);
	}
	if (profileContainer !== undefined) {
		mapArea.removeChild(profileContainer);
	}

	profileContainer = document.createElement("div");
	profileContainer.id = "profileContainer";
	mapArea.appendChild(profileContainer);

	profileCanvas = document.createElement("canvas"); //create map area
	profileCanvas.id = "profileCanvas";
	profileCanvas.width = 700;
	profileCanvas.height = 300;
	profileContainer.appendChild(profileCanvas);
}

function drawHeight(coordinates) {
	let heightPoints = [];
	let ctx = profileCanvas.getContext("2d");
	ctx.transform(1, 0, 0, -1, 0, profileCanvas.height);

	for (let i = 0; i < coordinates.length; i++) {
		heightPoints.push(coordinates[i][2]);
	}

	ctx.beginPath();
	ctx.lineWidth = 1;
	ctx.fillStyle = "white";
	ctx.strokeStyle = "white";

	let min = Math.min.apply(Math, heightPoints);
	let max = Math.max.apply(Math, heightPoints);
	let diff = max - min;

	let height = document.getElementById("profileCanvas").height;
	let width = document.getElementById("profileCanvas").width;

	ctx.moveTo(0, 0);

	for (let i = 0; i < heightPoints.length; i++) {
		ctx.lineTo(((i / heightPoints.length) * width), ((heightPoints[i] - min) / diff) * height);
	}

	ctx.lineTo(width, 0);
	ctx.closePath();
	ctx.fill();
}

function highlightSelectedTrack(id) {
	if (mapLayer !== undefined) {
		mapView.removeLayer(mapLayer);
	}
	addCanvas();
	//let selectedTrack = JSON.parse(this.responseText); // get answer from api
	let selectedTrack = allTracks[id];
	// console.log(selectedTrack.features[0].geometry.coordinates); // output the name of the response
	let style = {
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

function loadSelectedTrack(event) {
	var elements = document.querySelectorAll(".trackButton.active");

	for (let i = 0; i < elements.length; i++) {
		elements[i].classList.remove("active");
	}

	event.target.className += " active";
	let id = event.target.id; // get id from <span id="THIS IS THIS ID">
	highlightSelectedTrack(id);
	//functions.loadFile(serverPath + "api/tracks/" + id, highlightSelectedTrack); // load from the api
}

function addTracksToList(name, id) {
	let trackButton = document.createElement("span"); // create track element
	trackButton.innerHTML = name; // set name
	trackButton.className = "trackButton"; // set class
	trackButton.id = id; // set id to it's own id (this is == the id in the api)
	tracks.appendChild(trackButton); // add to the list
	trackButton.addEventListener("click", loadSelectedTrack, false); // on click load infomation of the track
}

function backPage() {
	removeInactive();
	if (currentPage > 1) {
		currentPage--;
	}

	setControls();
}

function nextPage() {
	removeInactive();
	if (currentPage < totalPages) {
		currentPage++;
	}

	setControls();
}

function removeInactive() {
	let left = document.getElementById("leftArrow");
	left.classList.remove("inactive");
	let right = document.getElementById("rightArrow");
	right.classList.remove("inactive");
}

function addControls() {
	let arrowBox = document.createElement("div");
	arrowBox.id = "arrowBox";
	controls.appendChild(arrowBox);

	let leftArrow = document.createElement("i");
	leftArrow.classList.add("fa", "fa-chevron-left");
	leftArrow.id = "leftArrow";
	arrowBox.appendChild(leftArrow);
	arrowBox.innerHTML += "&nbsp;&nbsp;";

	let rightArrow = document.createElement("i");
	rightArrow.classList.add("fa", "fa-chevron-right");
	rightArrow.id = "rightArrow";
	arrowBox.appendChild(rightArrow);

	let pages = document.createElement("div");
	pages.id = "pages";
	pages.innerHTML = currentPage + "/" + totalPages;
	controls.appendChild(pages);
	setControls();
}

function windowResize() {
	currentPage = 1;
	initMapView();
	setControls();
	removeInactive();
	setCurrentPage();
}

function setControls() {
	let tracksHeight = mapArea.clientHeight;
	let controlsHeight = controls.clientHeight; // 50px
	let trackBoxHeight = tracksHeight - controlsHeight; // trackbox höhe ohne controls
	maxItemsOnCurrentPage = Math.floor(trackBoxHeight / 40); // wie viele tracks bei aktueller auflösung reinpassen

	totalPages = Math.ceil(allTracks.length / maxItemsOnCurrentPage); // max pages

	let pages = document.getElementById("pages");
	pages.innerHTML = currentPage + "/" + totalPages;
	setCurrentPage();
}

function setCurrentPage() {
	while (tracks.firstChild) {
		tracks.removeChild(tracks.firstChild);
	}

	if (currentPage === 1) {
		let left = document.getElementById("leftArrow");
		left.className += " inactive";
	}

	if (currentPage === totalPages) {
		let right = document.getElementById("rightArrow");
		right.className += " inactive";
	}

	let tracksHeight = mapArea.clientHeight;
	let controlsHeight = controls.clientHeight; // 50px
	let trackBoxHeight = tracksHeight - controlsHeight; // trackbox höhe ohne controls

	maxItemsOnCurrentPage = (Math.floor(trackBoxHeight / 40)); // wie viele tracks bei aktueller auflösung reinpassen

	if (currentPage === 1) {
		currentFirstItem = 0;
	}
	else {
		currentFirstItem = (currentPage - 1) * maxItemsOnCurrentPage;
	}

	for (let i = currentFirstItem; i < (currentFirstItem + maxItemsOnCurrentPage); i++) {
		if (allTracks[i] !== undefined) {
			addTracksToList(getTrackName(allTracks[i]), i);
		}
	}
}

function getTrackName(track) {
	if (track !== null) {
		return track.features[0].properties.name;
	}
	return "error!";
}
