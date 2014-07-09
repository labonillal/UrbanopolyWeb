var request = require('request');
var GeoJSON = require('geojson');

var gameConf = require("../core/game"); //Game Configuration
var gameController = require('./GameController'); //GameController
var Utility = require('./Utility'); //UtilityController
var Venue = require('../models/venue');	//Venue Model
var Visit = require('../models/visit');	//Visit Model

// Local variables
var servicePlayArea = "GetPlayArea";

//RetrieveMap
exports.getMapData = function (req, res){
 	
	var venuesCollection = [];
	var visitsCollection = [];

	console.log('PLAYER ID: ' + req.user.id);
	console.log('LATITUD: ' + req.query.lat);
	console.log('LONGITUD: ' + req.query.lon);

	// Prepare a request object
	var str = "{0}/{1}?uid={2}&lat={3}&lon={4}&maxDist={5}";
	var requestUrl = str.format(Utility.getServerAddress(), servicePlayArea, req.user.id, req.query.lat, req.query.lon, gameConf.maxDistance);
	console.log("PLAYER: %j", req.user.id);
	console.log("REQUEST_URL: %j", requestUrl);

	// Request to retrieve game area info from url
  	request({
    	url: requestUrl,
    	method: "GET",
    	timeout: 10000
  	}, function (error, response, data) {
    	if (!error && response.statusCode === 200) {
			//Parse server response object
			var reply = JSON.parse(data);
			var venuesJson = reply[0];
			var visitsJson = reply[1];
			var playerJson = reply[2];
			var playDay = reply[3];
			var dayDuration = reply[4];
			//console.log('Number of venues retrieved: %j',venuesJson.length);
			//console.log('Number of visits retrieved: %j',visitsJson.length);
			//console.log('Player data: %j',playerJson);
			//console.log('Play Day: %j',playDay);
			//console.log('Day Duration: %j',dayDuration);
				
			//Iterating over the venues info turning onto local Venue objects
			for(var i = 0; i < venuesJson.length; i++){
				//CUSTOM DESERIALIZER MANAGEMENT
				if(venuesJson[i]["wheel"] != null ){
					//Already implemented on venue model
				}
				if(venuesJson[i]["state"] != null && venuesJson[i]["state"] == 'FREE'){
					venuesJson[i]["state"] = 'FREE'; // Remain as free
				}else{
					if(venuesJson[i]["ownerId"] != null && req.user.id == venuesJson[i]["ownerId"]){
						if(venuesJson[i]["mortgaged"] == true){
							venuesJson[i]["state"] = 'MINE_MORTGAGED';
						}else{
							venuesJson[i]["state"] = 'MINE';
						}
						// id and name already on the json object
					}else{
						venuesJson[i]["state"] = 'OCCUPIED';
						// id and name already on the json object
					}
				}
				if(venuesJson[i]["state"] == 'MINE_MORTGAGED'){
					// set deadTime but its already on the json object
				}

				// lat, lon and category are already on the json object

				//ICON MANAGEMENT
				//General properties of the icon set
				venuesJson[i]["icon"] = {
					"iconUrl": "./images/venue_other_cheap.png",
					"iconSize": [50, 50],
					"iconAnchor": [25, 25],
					"popupAnchor": [0, -25],
					"className": "dot"
				};

				//The type of the venue is verified to set the icon
				if(venuesJson[i]["state"] == 'MINE'){
					//The value is verified to select the right color
					if(venuesJson[i]["value"] < gameConf.mediumVenueThreshold){
						venuesJson[i]["icon"]["iconUrl"] = "./images/venue_mine_cheap.png";
					}else if(venuesJson[i]["value"] < gameConf.expensiveVenueThreshold){
						venuesJson[i]["icon"]["iconUrl"] = "./images/venue_mine_medium.png";
					}
					else{
						venuesJson[i]["icon"]["iconUrl"] = "./images/venue_mine_expensive.png";
					}
				}
				else if (venuesJson[i]["state"] == 'MINE_MORTGAGED'){
					//The value is verified to select the right color
					if(venuesJson[i]["value"] < gameConf.mediumVenueThreshold){
						venuesJson[i]["icon"]["iconUrl"] = "./images/venue_mortgaged_cheap.png";
					}
					else if(venuesJson[i]["value"] < gameConf.expensiveVenueThreshold){
						venuesJson[i]["icon"]["iconUrl"] = "./images/venue_mortgaged_medium.png";
					}
					else{
						venuesJson[i]["icon"]["iconUrl"] = "./images/venue_mortgaged_expensive.png";
					}
				}
				else{
					//The value is verified to select the right color
					if(venuesJson[i]["value"] < gameConf.mediumVenueThreshold){
						venuesJson[i]["icon"]["iconUrl"] = "./images/venue_other_cheap.png";
					}
					else if(venuesJson[i]["value"] < gameConf.expensiveVenueThreshold){
						venuesJson[i]["icon"]["iconUrl"] = "./images/venue_other_medium.png";
					}
					else{
						venuesJson[i]["icon"]["iconUrl"] = "./images/venue_other_expensive.png";
					}
				}
				
				//Create an object from the json representation
				var venue = Venue.parse(venuesJson[i]);

				//Add the object to the collection
				venuesCollection.push(venue);
			}
		
			//Iterating over the visits info turning onto local Visit objects
			for(var j = 0; j < visitsJson.length; j++){
				var visit = Visit.parse(visitsJson[j]);
				visitsCollection.push(visit);
			}
			
			//console.log('VENUES COLLECTION LENGTH: %j', venuesCollection.length);
			//console.log('COLLECTION venuesCollection[0]:');
			//console.log(venuesCollection[0]);
			//console.log('VISITS COLLECTION LENGTH: %j', visitsCollection.length);
			//console.log('COLLECTION visitsCollection[0]:');
			//console.log(visitsCollection[0]);
			
			//Convert the array of geographic objects to GeoJson
			if(typeof venuesCollection != 'undefined' && venuesCollection.length > 0) {
				GeoJSON.parse(venuesCollection, {Point: ['lat', 'lon']}, function(geojson){
					res.send(geojson);
				});
			}else{
				res.send(null);
			}		
		}else{
			console.log("Unable to connect to database server: %j", error);
		}
	})
}