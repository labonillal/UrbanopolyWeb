//
// UrbanopolyWeb v1.5.0
// 
// Copyright (c) 2012-2014, CEFRIEL
// Licensed under the Apache 2.0 License.
//

/* Loading Module Dependencies */
var request = require("request");
var formData = require('form-data');
var gameConf = require("../core/game");
var gameController = require('./GameController');
var visitController = require('./VisitController');
var Venue = require('../models/venue');
var Visit = require('../models/visit');
var VisitQuiz = require('../models/visitQuiz');
var VisitAdvertise = require('../models/visitAdvertise');
var VisitJudge = require('../models/visitJudge');
var Utility = require('./Utility');

// Local variables
var venues = [];
var visitedVenues = [];
var serviceUserVenues = "GetPlayerVenues";
var serviceUploadPhoto = "UploadPhoto";

exports.addVisitedVenue = function(visit){
	console.log('Function addVisitedVenue start');
	var alreadyVisited = false;
	if(visitedVenues.length == 0){
		var newVisitedVenue = { "player" : visit.player, "venue" : visit.venue };
		visitedVenues.push(newVisitedVenue);
	}else{
		for(var i in visitedVenues){
			var visitedVenue = visitedVenues[i];
			// If the venue exists in the array
			if(visit.player == visitedVenue.player && visit.venue == visitedVenue.venue){
				alreadyVisited = true;
			}
		}
		if(!alreadyVisited){
			var newVisitedVenue = { "player" : visit.player, "venue" : visit.venue };
			visitedVenues.push(newVisitedVenue);
		}
	}
	console.log('VISITED VENUES: ', visitedVenues);
	console.log('Function addVisitedVenue finish');
};

exports.clearPlayerVisitedVenues = function(playerId, callback){
	console.log('Function clearPlayerVisitedVenues start');
	console.log('visitedVenues BEFORE CLEAR: ', visitedVenues);
	try{
		var length = visitedVenues.length
		while(length--){
			var visitedVenue = visitedVenues[length];
			// If the entry belongs to the player
			if(playerId == visitedVenue.player){
				visitedVenues.splice(length, 1);
				console.log('visitedVenues['+ length +'] removed!');
			}
		}
	}catch(err){
		callback(err);
	}
	console.log('visitedVenues AFTER CLEAR: ', visitedVenues);
	console.log('Function clearPlayerVisitedVenues finish');
	callback(null, visitedVenues);
}

exports.getAlreadyVisitedVenues = function(playerId, callback){
	console.log('Function getAlreadyVisitedVenues start...');
	try{
		var playerAlreadyVisited = [];
		for(var i in visitedVenues){
			var visitedVenue = visitedVenues[i];
			if(playerId == visitedVenue.player){
				playerAlreadyVisited.push(visitedVenue.venue);
			}
		}
	}catch(err){
		callback(err);
	}
	console.log('Function getAlreadyVisitedVenues finish...');
	callback(null, playerAlreadyVisited);
}

exports.downloadMyVenues = function(playerId, callback){
	console.log('Function downloadMyVenues start...');
	var venuesCollection = [];
	var visitsCollection = [];
	var str = "{0}/{1}?uid={2}";
  	var requestUrl = str.format(Utility.getServerAddress(), serviceUserVenues, playerId);

  	//console.log("PLAYER: %j", playerId);
	//console.log("REQUEST_URL: %j", requestUrl);

	// Request to retrieve the venues of the player
	request({
		url: requestUrl,
		method: "GET"
	}, function (error, response, data) {
		if (!error && response.statusCode === 200) {
			//console.log(data);
			//Parse server response object
			var reply = JSON.parse(data);
			var venuesJson = reply[0];
			var visitsJson = reply[1];
			var playerJson = reply[2];
			//console.log('VENUES:');
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
				//console.log(venue);
				//Add the object to the collection
				venuesCollection.push(venue);
			}
			//Iterating over the visits info turning onto local Visit objects
			for(var j = 0; j < visitsJson.length; j++){
				var visit;
				if(visitsJson[j]["type"] == 'QUIZ'){
					//TO DO: Uncomment
					//visit = VisitQuiz.parse(myQuiz);
					visit = VisitQuiz.parse(visitsJson[j]);
					visitsCollection.push(visit);
				}else if(visitsJson[j]["type"] == 'ADVERTISE'){
					//TO DO: Uncomment
					//visit = VisitAdvertise.parse(myAdvertise);
					visit = VisitAdvertise.parse(visitsJson[j]);
					visitsCollection.push(visit);
				}else if(visitsJson[j]["type"] == 'JUDGE'){
					//TO DO: Uncomment
					//visit = VisitJudge.parse(myJudge);
					visit = VisitJudge.parse(visitsJson[j]);
					visitsCollection.push(visit);
				}else{
					visit = Visit.parse(visitsJson[j]);
					visitsCollection.push(visit);
				}
			}
			visitController.addInVisits(visitsCollection);
			console.log('Function downloadMyVenues finish...');
			callback(null, venuesCollection, visitsCollection);	
		}else{
			console.log("ERROR: Unable to connect to database server: %j", error);
			callback(error);
		}
	})
};

function addVenue(venue){
	var index = venues.indexOf(venue);
	if(index == -1){
		if(typeof venue.name == 'undefined'){
			venue.name = 'Unnamed Venue';
		}
		venues.push(venue);
	}
};

exports.updateVenue = function(newVenue){
	console.log('Function updateVenue start');
	var index = venues.indexOf(newVenue);
	if(index > -1){
		venues.splice(index, 1);
		venues.push(newVenue);
	}
	console.log('Function updateVenue finish');
};

exports.addVenues = function(newVenues){
	for (var i in newVenues){
		var newVenue = newVenues[i];
		addVenue(newVenue);
	}
};

exports.venueTaken = function(venue){
	console.log('Function venueTaken start');
	if(typeof venue != 'undefined' && venue.state == 'MINE' || typeof venue != 'undefined' && venue.state == 'MINE_MORTGAGED'){
		venue.state = 'OCCUPIED';
		addVisitedVenue(venue);
	}
	console.log('Function venueTaken finish');
};

exports.lostMortgagedVenue = function(player, venue){
	console.log('Function lostMortgagedVenue start');
	if(typeof venue != 'undefined' && venue.state == 'MINE_MORTGAGED'){	
		var mortgageValue = parseInt(venue.value * gameConf.mortgagePercentage/100);
		player.cash += (venue.value - mortgageValue);
		venue.state = 'FREE';
		addVisitedVenue(venue);
	}
	console.log('Function lostMortgagedVenue finish');
};

exports.lostVenue = function(player, venue){
	console.log('Function lostVenue start');
	if(typeof venue != 'undefined' && venue.state == 'MINE'){
		player.cash += venue.value;	
		venue.state = 'FREE';	
		addVisitedVenue(venue);
	}
	console.log('Function lostVenue finish');
};

exports.uploadPhoto = function(bitmap, venueId, playerId, callback){
	console.log('Function uploadPhoto start');
	//Prepare the request
	var str = "{0}/{1}";
  	var requestUrl = str.format(Utility.getServerAddress(), serviceUploadPhoto);
  	console.log('REQUEST_URL: ', requestUrl);
  	// Request to save the uploaded photo
  	var form = new formData();

	form.append('photo', bitmap);
	form.append('venueId', venueId);
	form.append('uid', playerId);

	form.submit(requestUrl, function(err, res) {
		// res – response object (http.IncomingMessage)  //
		if (!err && res.statusCode === 200) {
			res.resume(); // for node-0.10.x
			console.log('Function uploadPhoto finish');
			callback(null, res.statusCode);
		}
		else{
			console.log('Unable to upload photo: ', err);
			console.log('Function uploadPhoto finish');
			callback(err);
    	}
	});
}