var myMarkersLayer;
var myPositionLayer;

$(document).ready(function(){
	// MapBox Map
	var map = L.mapbox.map('map', 'lbonillal.i2gblid1').setView([45, 9], 9);

	myMarkersLayer = L.mapbox.featureLayer().addTo(map);

	map.locate();
			
	map.on('locationfound', function(e) {
		console.log('Location Coordinates: ' + e.latlng.lng+' , ' + e.latlng.lat);
		map.fitBounds(e.bounds);

		//request map data to the server
		requestUpdatedMap(e.latlng.lat, e.latlng.lng);
		
		var geoJson = [{
				"type": "Feature",
				"geometry": {
					"type": "Point",
					"coordinates": [e.latlng.lng, e.latlng.lat]
				},
				"properties": {
					"title": "Me",
					"icon": {
						"iconUrl": "./images/gps_position.png",
						"iconSize": [50, 50],
						"iconAnchor": [25, 25],
						"popupAnchor": [0, -25],
						"className": "dot"
					}
				}
			}
		];
		
		// Set a custom icon on each marker based on feature properties for myMarkersLayer
		myMarkersLayer.on('layeradd', function(e) {
			var marker = e.layer,
			feature = marker.feature;

			marker.setIcon(L.icon(feature.properties.icon));
		});
		
		// My position on the map
		myPositionLayer = L.mapbox.featureLayer().addTo(map);
		
		// Set a custom icon on each marker based on feature properties for myPositionLayer
		myPositionLayer.on('layeradd', function(e) {
			var marker = e.layer,
			feature = marker.feature;

			marker.setIcon(L.icon(feature.properties.icon));
		});
		
		myPositionLayer.setGeoJSON(geoJson);
	});

	// If the user chooses not to allow their location
	// to be shared, display an error message.
	map.on('locationerror', function() {
		console.log('Position could not be found!');
	});
});

function requestUpdatedMap(lat, lon) {
	var temp = '/RetrieveMap?lat=' + lat + '&lon=' + lon;
	console.log('REQUEST URL: %j',temp);
    $.ajax(
		{
            type: 'GET',
            url: '/RetrieveMap?lat=' + lat + '&lon=' + lon,
            success: function (result) {
				myMarkersLayer.setGeoJSON(result);
            },
            error: function (req, status, error) {
				console.log('ERROR: ' + error);
				console.log('Unable to get map data');
            }
        });
}