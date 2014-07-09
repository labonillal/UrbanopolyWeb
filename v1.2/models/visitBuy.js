/**
 Parse VisitBuy

	{ "type" : "QUIZ",
	  "player" : "774274788",
	  "venue" : 33912,
	  "venueName" : "Name",
	  "venueCategory" : "Category",
	  "date" : null,
	  "deltaMoney" : 0,
	  "sent" : 0,
	  "offensive":false}
*/

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
	visit.venueName = json.venueName;
	visit.venueCategory = json.venueCategory;
	visit.date = json.date;
	visit.deltaMoney = json.deltaMoney;
	visit.sent = json.sent;
	visit.offensive = json.offensive;
	
	return visit;
};