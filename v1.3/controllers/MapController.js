var request = require('request');
var GeoJSON = require('geojson');

var gameConf = require("../core/game"); //Game Configuration
var gameController = require('./GameController'); //GameController
var venueController = require('./VenueController'); //VenueController
var visitController = require('./VisitController'); //VisitController
var Utility = require('./Utility'); //UtilityController
var Venue = require('../models/venue');	//Venue Model
var Visit = require('../models/visit');	//Visit Model
var VisitQuiz = require('../models/visitQuiz');	//VisitQuiz Model
var VisitAdvertise = require('../models/visitAdvertise');	//VisitAdvertise Model

// Local variables
var servicePlayArea = "GetPlayArea";
var myQuiz = {"type":"QUIZ","player":"774274788","venue":2304,"date":null,"deltaMoney":0,"sent":0,"questions":["does it sell drugs without prescription? (yes/no)","what\u0027s its cuisine type?","do wheelchairs have full unrestricted access? (yes/no)","does it sell drugs without prescription? (yes/no)", "what type of transport is there available?"],"skips":null,"options":[["yes","no",null,null],["japanese","Brazilian","Chicken","Sandwich"],["no","yes",null,null],["yes","no",null,null],["bus","tram","aerialway","monorail"]],"selected":[],"feature":[{"name":"dispensing","id":363,"advertiseQuestion":"does it sell drugs without prescription? (yes/no)","featureRange":{"id":135,"values":["no"],"type":"closed","openDataType":"null"},"multivalue":false},{"name":"wheel chair","id":428,"advertiseQuestion":"do wheelchairs have full unrestricted access? (yes/no)","featureRange":{"id":135,"values":["yes"],"type":"closed","openDataType":"null"},"multivalue":false}],"offensive":false};
var myAdvertise = {"type":"ADVERTISE","player":"774274788","venue":2304,"date":null,"deltaMoney":0,"sent":0,"venueName":"Valduce","venueCategory":null,"skips":[],"featureTypes":[{"name":"street","id":326,"advertiseQuestion":"what is the name of the street?","featureRange":{"id":133,"values":[],"type":"open","openDataType":"null"},"multivalue":false},{"name":"housenumber","id":324,"advertiseQuestion":"what is the house number?","featureRange":{"id":133,"values":[],"type":"open","openDataType":"null"},"multivalue":false},{"name":"postcode","id":325,"advertiseQuestion":"what is the post code?","featureRange":{"id":133,"values":[],"type":"open","openDataType":"null"},"multivalue":false}],"featureValues":[],"offensive":false,"finishAt":-1};

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
			//TO DO: Uncomment
			var visitsJson = [{"type":"QUIZ"},{"type":"ADVERTISE"}];
			//var visitsJson = reply[1];
			var playerJson = reply[2];
			var playDay = reply[3];
			var dayDuration = reply[4];
			//console.log('Number of venues retrieved: %j',venuesJson.length);
			//console.log('Number of visits retrieved: %j',visitsJson.length);
			//console.log('Player data: %j',playerJson);
			//console.log('Play Day: %j',playDay);
			//console.log('Day Duration: %j',dayDuration);
			
			//Iterating over the visits first to get the info of each venue after
			for(var j = 0; j < visitsJson.length; j++){
				var visit;
				if(visitsJson[j]["type"] == 'QUIZ'){
					//TO DO: Uncomment
					visit = VisitQuiz.parse(myQuiz);
					//visit = VisitQuiz.parse(visitsJson[j]);
					visitsCollection.push(visit);
				}else if(visitsJson[j]["type"] == 'ADVERTISE'){
					//TO DO: Uncomment
					visit = VisitAdvertise.parse(myAdvertise);
					//visit = VisitAdvertise.parse(visitsJson[j]);
					visitsCollection.push(visit);
				}else{
					visit = Visit.parse(visitsJson[j]);
					visitsCollection.push(visit);
				}
			}

			//Iterating over the venues info turning onto local Venue objects
			for(var i = 0; i < venuesJson.length; i++){
				//Set up the venue with the icon and geolocation info
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
				
				//Setup the advertise and quiz info if its available
				for(var k in visitsCollection){
					//For each element on the visits collection
					//console.log('visit[' + k + ']: ', visitsCollection[k]);
					var visitQzAd = visitsCollection[k];
					//If a visit corresponding to the venue was found
					if(venuesJson[i]["id"] == visitQzAd["venue"]){
						//If is not null and is QUIZ type
						if(typeof visitQzAd != 'undefined' && visitQzAd["type"] == 'QUIZ'){
							venuesJson[i]["quiz"] = visitQzAd;
						//If is not null and is ADVERTISE type
						}else if(typeof visitQzAd != 'undefined' && visitQzAd["type"] == 'ADVERTISE'){
							venuesJson[i]["advertise"] = visitQzAd;
						}
					}
				}
				//Create an object from the json representation
				var venue = Venue.parse(venuesJson[i]);

				//Add the object to the collection
				venuesCollection.push(venue);
			}
			
			console.log('VENUES COLLECTION LENGTH: %j', venuesCollection.length);
			console.log('COLLECTION venuesCollection[0]:');
			console.log(venuesCollection[0]);
			console.log('VISITS COLLECTION LENGTH: %j', visitsCollection.length);
			console.log('COLLECTION visitsCollection[0]:');
			console.log(visitsCollection[0]);
			console.log('COLLECTION visitsCollection[1]:');
			console.log(visitsCollection[1]);

			venueController.addVenues(venuesCollection);
			visitController.addInVisits(visitsCollection);
			
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