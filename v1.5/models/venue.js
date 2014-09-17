//
// UrbanopolyWeb v1.5.0
// 
// Copyright (c) 2012-2014, CEFRIEL
// Licensed under the Apache 2.0 License.
//


// Parse Venue
exports.parse = function(json) {
	//If the data is the type string is pased to json
	if ('string' == typeof json){
		json = JSON.parse(json);
	}
  
	//Object declaration
	var venue = {};
	
	//Attributes
	venue.id = json.id;
	venue.name = json.name;
	venue.value = json.value;
	venue.category = json.category;
	venue.lat = json.lat;
	venue.lon = json.lon;
	venue.state = json.state;
	venue.ownerId = json.ownerId;
	venue.ownerName = json.ownerName;
	venue.wheel = json.wheel;
	venue.deadTime = json.deadTime;
	venue.mortgaged = json.mortgaged;
	venue.icon = json.icon;				//icon attribute added to manage the venue graphic representation
	venue.quiz = json.quiz;				//quiz attribute to set the quiz info and make it available on map load
	venue.advertise = json.advertise;	//advertise attribute to set the advertise info and make it available on map load
	
	return venue;
}