var map = require("leaflet");

let content = document.getElementById("content");

let mapArea = document.createElement("div");
mapArea.id = "mapArea";
content.appendChild(mapArea);

var mapView = map.map("mapArea").setView([51.505, -0.09], 13);

/*map.tileLayer("https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token={accessToken}", {
	attribution: 'Map data &copy; <a href="http://openstreetmap.org">OpenStreetMap</a> contributors, <a href="http://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, Imagery © <a href="http://mapbox.com">Mapbox</a>',
	maxZoom: 18,
	id: "",
	accessToken: "pk.eyJ1IjoibWFyY2hlaW4iLCJhIjoiY2ozNHB6ZnE2MDBzdjJxcGx1bTMzYmIycyJ9.EywC_JuAXu26l7y_KVu3gQ"
}).addTo(mapView);*/

