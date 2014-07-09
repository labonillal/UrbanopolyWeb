/* Loading Module Dependencies */
var request = require("request");
var gameConf = require("../core/game");
var gameController = require('./GameController');
var Venue = require('../models/venue');
var Visit = require('../models/visit');
var Utility = require('./Utility');

// Local variables
var venues = [];
var visitedVenues = [];
var serviceUserVenues = "GetPlayerVenues";

exports.addVisitedVenue = function(venue){
	console.log('Function addVisitedVenue start');
	if(visitedVenues.indexOf(venue.id) == -1){
		visitedVenues.push(venue);
	}
};

exports.downloadMyVenues = function(playerId, callback){
	console.log('Function downloadMyVenues start...');
	var venuesCollection = [];
	var visitsCollection = [];
	var str = "{0}/{1}?uid={2}";
  	var requestUrl = str.format(Utility.getServerAddress(), serviceUserVenues, playerId);

  	console.log("PLAYER: %j", playerId);
	console.log("REQUEST_URL: %j", requestUrl);

	// Request to retrieve the venues of the player
	request({
		url: requestUrl,
		method: "GET",
		timeout: 10000
	}, function (error, response, data) {
		if (!error && response.statusCode === 200) {
			console.log(data);
			//Parse server response object
			var reply = JSON.parse(data);
			var venuesJson = reply[0];
			var visitsJson = reply[1];
			var playerJson = reply[2];
			console.log('VENUES:');
			//Iterating over the venues info turning onto local Venue objects
			for(var i = 0; i < venuesJson.length; i++){
				if(venuesJson[i]["mortgaged"] == true){
					venuesJson[i]["state"] = 'MINE_MORTGAGED';
				}else{
					venuesJson[i]["state"] = 'MINE';
				}

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
				}else{
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

				//Set the category name
				var categoryJson = gameController.getCategoryById(venuesJson[i]["category"]);
				venuesJson[i]["category"] = categoryJson;
				
				//Create an object from the json representation
				var venue = Venue.parse(venuesJson[i]);
				console.log(venue);
				//Add the object to the collection
				venuesCollection.push(venue);
			}
			console.log('VISITS:');
			//Iterating over the visits info turning onto local Visit objects
			for(var j = 0; j < visitsJson.length; j++){
				var visit = Visit.parse(visitsJson[j]);
				console.log(visit);
				visitsCollection.push(visit);
			}
			console.log('Function downloadMyVenues finish...');
			callback(null, venuesCollection);	
		}else{
			console.log("ERROR: Unable to connect to database server: %j", error);
			callback(error);
		}
	})
};

exports.updateVenue = function(newVenue){
	console.log('Function updateVenue start');
	var index = venues.indexOf(newVenue);
	if(index > -1){
		venues.splice(index, 1);
		venues.push(newVenue);
	}
};

exports.venueTaken = function(venue){
	console.log('Function venueTaken start');
	if(typeof venue != 'undefined' && venue.state == 'MINE' || typeof venue != 'undefined' && venue.state == 'MINE_MORTGAGED'){
		venue.state = 'OCCUPIED';
		addVisitedVenue(venue);
	}
};

exports.lostMortgagedVenue = function(player, venue){
	if(typeof venue != 'undefined' && venue.state == 'MINE_MORTGAGED'){	
		var mortgageValue = parseInt(venue.value * gameConf.mortgagePercentage/100);
		player.cash += (venue.value - mortgageValue);
		venue.state = 'FREE';
		addVisitedVenue(venue);
	}
};

exports.lostVenue = function(player, venue){	
	if(typeof venue != 'undefined' && venue.state == 'MINE'){
		player.cash += venue.value;	
		venue.state = 'FREE';	
		addVisitedVenue(venue);
	}
};