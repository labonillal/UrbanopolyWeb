/**
 Parse VisitAdvertise

	 {"type":"JUDGE",
	 "player":"774274788",
	 "venue":32579,
	 "date":null,
	 "deltaMoney":0,
	 "sent":0,
	 "venueName":" Intesa San Paolo",
	 "venueCategory":581,
	 "featureTypes":
	 	[{	"name":"street",
	 		"id":326,
	 		"advertiseQuestion":"what is the name of the street?",
	 		"featureRange":{
	 			"id":133,
	 			"values":[],
	 			"type":"open",
	 			"openDataType":"null"},
	 		"multivalue":false},
	 	{	"name":"housenumber",
	 		"id":324,
	 		"advertiseQuestion":"what is the house number?",
	 		"featureRange":{
	 			"id":133,
	 			"values":[],
	 			"type":"open",
	 			"openDataType":"null"},
	 		"multivalue":false},
	 	{	"name":"postcode",
	 		"id":325,
	 		"advertiseQuestion":"what is the post code?",
	 		"featureRange":{
	 			"id":133,
	 			"values":[],
	 			"type":"open",
	 			"openDataType":"null"},
	 		"multivalue":false}],
	 "featureValues":[null,null,"22100"],
	 "photoRank":0,
	 "idPhoto":null,
	 "idAdvertiseVisit":5011,
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
	visit.date = json.date;
	visit.deltaMoney = json.deltaMoney;
	visit.sent = json.sent;
	visit.venueName = json.venueName;
	visit.venueCategory = json.venueCategory;
	visit.featureTypes = json.featureTypes;
	visit.featureValues = json.featureValues;
	visit.photoRank = json.photoRank;
	visit.idPhoto = json.idPhoto;
	visit.idAdvertiseVisit = json.idAdvertiseVisit;
	visit.offensive = json.offensive;
	
	return visit;
};