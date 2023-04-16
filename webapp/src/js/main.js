let leaflet = require("leaflet"); // npm modul für die map hinzufügen
let functions = require("./function.js"); // eigene funktionen einfügen
document.querySelector("head").innerHTML += "<link rel='stylesheet' href='http://cdn.leafletjs.com/leaflet-0.7.3/leaflet.css' />"; // leaflet css einbinden
document.querySelector("head").innerHTML += "<link rel='stylesheet' href='https://maxcdn.bootstrapcdn.com/font-awesome/4.7.0/css/font-awesome.min.css'>"; // font awesome einfügen für die pfeile

let allTracks = [];
// lokale speicherung der tracks
// so muss nicht bei jedem aufruf eines tracks
// die api neu angefragt werden, sondern kann einfach auf
// die position im array zugegriffen werden
// dh: .../api/tracks/22 gibt das gleiche ergebnis wie
// allTracks[22] -> /api/tracks/22 === allTracks[22] --> true

let serverPath = document.URL; // die aktuelle adresse des servers

let profileCanvas; // canvas in dem das höhenprofile gezeichnet wird
let profileContainer; // container für den canvas, sodass man ein padding anwenden kann

let maxItemsOnCurrentPage; // maximale anzahl an tracks auf einer seite
let currentSelectedTrack = -1; // momentan ausgewähler track -> -1 = kein Track ausgewählt

let currentFirstItem = 0; // gibt immer die id an des ersten items auf der $currentPage -> bei aufruf der seite immer zuerst allTracks[0]
let currentPage = 1; // welche seite momentan angezeigt wird -> bei aufruf der seite immer zuerst seite 1
let totalPages = 1; // wie viele seiten maximal vorhanden sind -> wird später überschrieben

let mapLayer;

let content = document.getElementById("content"); // sucht in der html datei den container mit der id "content"

let mapArea = document.createElement("div"); //create map area
mapArea.id = "mapArea";
content.appendChild(mapArea);

let trackArea = document.createElement("div"); // create right pane
trackArea.id = "trackArea";
content.appendChild(trackArea);

let controls = document.createElement("div"); // create control section
controls.id = "controls";
trackArea.appendChild(controls);

let tracks = document.createElement("div"); // create tracks section
tracks.id = "tracks";
trackArea.appendChild(tracks);

let mapView = leaflet.map("mapArea"); // leaflet map in div mit id mapArea erzeugen

function initMapView() {
	currentSelectedTrack = -1; // momentan ausgewählter track = -1 -> noch kein track ausgewählt
	clearMapLayer(); // falls was auf dem map layer ist, diesen leeren
	mapView.setView([49.749992, 6.637143299999934], 13); // mapView auf Trier mit Zoom Stufe 13 setzen
}

leaflet.tileLayer("https://tile.openstreetmap.org/{z}/{x}/{y}.png", {
	attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
	maxZoom: 18
}).addTo(mapView); // mapbox api zu leaflet map hinzufügen

function init() {
	allTracks = JSON.parse(this.responseText); // json antwort von der api parsen und in array laden
	window.addEventListener("resize", windowResize); // listener für window resize anmelden
	addControls(); // controls für die seiten hinzufügen
	let left = document.getElementById("leftArrow"); // arrows suchen
	let right = document.getElementById("rightArrow");
	left.addEventListener("click", backPage, true); // vor bzw. zurück auf den arrows anmelden
	right.addEventListener("click", nextPage, true);
	setCurrentPage(); // aktuelle seite anzeigen
	initMapView(); // mapview aufbauen
}

functions.loadFile(serverPath + "api/tracks/", init); // api aufrufen und mit Antwort die Funktion init() aufrufen

function clearMapLayer() {
	if (mapLayer !== undefined) { // wenn mapLayer vorhanden ist...
		mapView.removeLayer(mapLayer); //... mapLayer von mapView entfernen
	}
}

function addMarkers(coordinates) {
	if (mapLayer !== undefined) {
		// roter und grüner marker von github (leaflet color markers)
		let greenIcon = new leaflet.Icon({
			iconUrl: "https://cdn.rawgit.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-green.png",
			shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png",
			iconSize: [25, 41],
			iconAnchor: [12, 41],
			popupAnchor: [1, -34],
			shadowSize: [41, 41]
		});

		let redIcon = new leaflet.Icon({
			iconUrl: "https://cdn.rawgit.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-red.png",
			shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png",
			iconSize: [25, 41],
			iconAnchor: [12, 41],
			popupAnchor: [1, -34],
			shadowSize: [41, 41]
		});

		/*
		 * roten marker am ersten koordinatenpunkt setzen
		 * grünen marker am letzten koordinatenpunkt setzen
		 */

		leaflet.marker([coordinates[0][1], coordinates[0][0]], { icon: redIcon }).addTo(mapLayer);
		leaflet.marker([coordinates[coordinates.length - 1][1], coordinates[coordinates.length - 1][0]], { icon: greenIcon }).addTo(mapLayer);
	}
}
function addCanvas() {
	removeCanvas();

	// container erzeugen
	profileContainer = document.createElement("div");
	profileContainer.id = "profileContainer";
	mapArea.appendChild(profileContainer);

	// canvas erzeugen
	profileCanvas = document.createElement("canvas");
	profileCanvas.id = "profileCanvas";
	profileCanvas.width = 700;
	profileCanvas.height = 300;
	profileContainer.appendChild(profileCanvas);
	/*
	 * Canvas wird mit doppelter auflösung gerendert, als
	 * es angezeigt wird. So ist die anzeige schärfer.
	 * Gerenderte auflösung: 700*300
	 * angezeigte auflösung: 350*150 -> per css
	 */
}

function drawHeight(coordinates) {
	let heightPoints = []; // array für alle höhenpunkte anlegen
	let ctx = profileCanvas.getContext("2d"); // 2d context herstellen
	ctx.transform(1, 0, 0, -1, 0, profileCanvas.height); // canvas drehen -> 0,0 liegt nun unten links

	for (let i = 0; i < coordinates.length; i++) {
		heightPoints.push(coordinates[i][2]); // höhenpunkte in array einfügen
	}

	ctx.beginPath(); // pfad beginnen
	ctx.lineWidth = 1; // liniendicke
	ctx.fillStyle = "white"; // ausgefüllte farbe
	ctx.strokeStyle = "white"; // linien farbe

	let min = Math.min.apply(Math, heightPoints); // kleinster punkt
	let max = Math.max.apply(Math, heightPoints); // höchster punkt
	let diff = max - min; // maximale differenz

	let height = document.getElementById("profileCanvas").height; // höhe des canvas
	let width = document.getElementById("profileCanvas").width; // breite des canvas

	ctx.moveTo(0, 0); // linie bei 0,0 beginnen

	for (let i = 0; i < heightPoints.length; i++) {
		ctx.lineTo(((i / heightPoints.length) * width), ((heightPoints[i] - min) / diff) * height); // höhenprofil zeichnen
	}

	ctx.lineTo(width, 0); // an den untersten punkt unten rechts führen
	ctx.closePath(); // pfad schließen
	ctx.fill(); // füllen
}

function highlightSelectedTrack(id) {
	clearMapLayer(); // mapLayer löschen
	addCanvas(); // canvas hinzufügen

	let selectedTrack = allTracks[id]; // aktuellen track lokal speichern

	// style für die strecke anlegen
	let style = {
		color: "#ff0000",
		weight: 5
	};

	// geojson koordinaten in map anzeigen mit style
	// und mapLayer setzen
	mapLayer = leaflet.geoJSON(selectedTrack, {
		style: style
	});

	let coordinates = selectedTrack.features[0].geometry.coordinates; // koordinaten einfach speichern
	addMarkers(coordinates); // marker hinzufügen
	drawHeight(coordinates); // höhenprofil zeichnen

	mapView.fitBounds(mapLayer.getBounds()); // map zentrieren
	mapLayer.addTo(mapView); // mapLayer zur mapView hinzufügen
}

function loadSelectedTrack(event) {
	var elements = document.querySelectorAll(".trackButton.active");
	// alle aktiven trackButtons suchen
	// sollten nie mehr als einer sein
	for (let i = 0; i < elements.length; i++) {
		elements[i].classList.remove("active"); // alle active classnames in den trackButtons entfernen
	}

	event.target.className += " active"; // den ausgewählten button als active markieren
	let id = event.target.id; // id vom target, das das event getriggert hat bekommen <span id="THIS IS THIS ID">
	currentSelectedTrack = id; // aktuelle id speichern
	highlightSelectedTrack(id); // aktuellen track in der map einzeichnen
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
	if (currentPage > 1) { // kleinste mögliche seite === 1
		removeInactive(); // inaktive arrows entfernen
		currentPage--; // falls seite > 1, runterzählen
		setControls(); // aktuelle controlls setzen
	}
}

function nextPage() {
	if (currentPage < totalPages) { // größte mögliche seite === maxPages
		removeInactive(); // inaktive arrows entfernen
		currentPage++; // falls seite < maxPages, runterzählen
		setControls(); // aktuelle controlls setzen
	}
}

function removeInactive() {
	// buttons, die als inaktiv gesetzt sind, inactive entfernen
	let left = document.getElementById("leftArrow");
	left.classList.remove("inactive");
	let right = document.getElementById("rightArrow");
	right.classList.remove("inactive");
}

function addControls() {
	// box hinzufügen
	let arrowBox = document.createElement("div");
	arrowBox.id = "arrowBox";
	controls.appendChild(arrowBox);
	// linker arrow hinzufügen
	let leftArrow = document.createElement("i");
	leftArrow.classList.add("fa", "fa-chevron-left");
	leftArrow.id = "leftArrow";
	arrowBox.appendChild(leftArrow);
	arrowBox.innerHTML += "&nbsp;&nbsp;";
	// rechter arrow hinzufügen
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

function removeCanvas() {
	// falls canvas bereits vorhanden, canvas löschen
	if (profileCanvas !== undefined) {
		profileContainer.removeChild(profileCanvas);
		profileCanvas = undefined;
	}
	// falls canvascontainer bereits vorhanden, container löschen
	if (profileContainer !== undefined) {
		mapArea.removeChild(profileContainer);
		profileContainer = undefined;
	}
}

function windowResize() { // wird bei der veränderung der größe des fensters ausgerufen
	currentPage = 1; // aktuelle seite wird auf 1 gesetzt
	setControls();
	removeInactive(); // inaktive buttons werden entfernt
	removeCanvas();
	initMapView(); // mapView neu initialisieren
}

function setControls() {
	let tracksHeight = mapArea.clientHeight; // höhe der rechten trackbox === höhe der map
	let controlsHeight = controls.clientHeight; // 50px
	let trackBoxHeight = tracksHeight - controlsHeight; // trackbox höhe ohne controls
	maxItemsOnCurrentPage = Math.floor(trackBoxHeight / 40); // wie viele tracks bei aktueller auflösung reinpassen... 40 da jeder einzelne Track 40px hoch ist

	totalPages = Math.ceil(allTracks.length / maxItemsOnCurrentPage); // max pages

	let pages = document.getElementById("pages");
	pages.innerHTML = currentPage + "/" + totalPages;
	setCurrentPage(); // aktuelle seite wird gesetzt
}

function setPageInactive() {
	if (currentPage === 1) {
		let left = document.getElementById("leftArrow");
		left.className += " inactive";
		// wenn die seite === 1 ist, dann den linken button als inactive setzen
	}

	if (currentPage === totalPages) {
		let right = document.getElementById("rightArrow");
		right.className += " inactive";
		// wenn die seite === totalPages ist, den rechten button als inactive setzen
	}
}

function setCurrentPage() {
	setPageInactive();

	while (tracks.firstChild) {
		tracks.removeChild(tracks.firstChild);
	} // alle elemente aus der trackliste löschen

	let tracksHeight = mapArea.clientHeight; // höhe der rechten trackbox === höhe der map
	let controlsHeight = controls.clientHeight; // 50px
	let trackBoxHeight = tracksHeight - controlsHeight; // trackbox höhe ohne controls
	maxItemsOnCurrentPage = Math.floor(trackBoxHeight / 40); // wie viele tracks bei aktueller auflösung reinpassen

	if (currentPage === 1) {
		currentFirstItem = 0; // wenn seite === 1, erstes item -> id = 0
	}
	else {
		currentFirstItem = (currentPage - 1) * maxItemsOnCurrentPage; // sonst (aktuelle seite - 1) * maximale items auf aktueller seite
	}

	for (let i = currentFirstItem; i < (currentFirstItem + maxItemsOnCurrentPage); i++) {
		if (allTracks[i] !== undefined) {
			addTracksToList(getTrackName(allTracks[i]), i); // tracks zur liste hinzufügen
		}
	}

	let currentSelectedTrackSpan = document.getElementById(currentSelectedTrack);
	if (currentSelectedTrack !== -1 && 	currentSelectedTrackSpan !== null) {
		currentSelectedTrackSpan.className += " active";
		// wenn aktueller track !== -1 und es ein element mit der id auf der aktuellen seite gibt, dieses als active markieren
	}
}

function getTrackName(track) {
	if (track !== null) {
		return track.features[0].properties.name; // gibt trackname zurück
	}
	return "error!";
}
