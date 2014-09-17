//
// UrbanopolyWeb v1.5.0
// 
// Copyright (c) 2012-2014, CEFRIEL
// Licensed under the Apache 2.0 License.
//

// Parse VisitAdvertise
exports.parse = function(json) {
	//If the data is the type string is pased to json
	if ('string' == typeof json){
		json = JSON.parse(json);
	}
  
	//Object declaration
	var visit = {};
	
	//Attributes
	visit.type = json.type;
	visit.player = json.player;
	visit.venue = json.venue;
	visit.date = json.date;
	visit.deltaMoney = json.deltaMoney;
	visit.sent = json.sent;
	visit.venueName = json.venueName;
	visit.venueCategory = json.venueCategory;
	visit.skips = json.skips;
	visit.featureTypes = json.featureTypes;
	visit.featureValues = json.featureValues;
	visit.offensive = json.offensive;
	visit.finishAt = json.finishAt;
	
	return visit;
};