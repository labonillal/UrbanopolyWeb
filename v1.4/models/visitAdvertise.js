/**
 Parse VisitAdvertise

	{"type":"ADVERTISE",
	"player":"774274788",
	"venue":33912,
	"date":null,
	"deltaMoney":0,
	"sent":0,
	"venueName":"Valduce",
	"venueCategory":null,
	"skips":[],
	"featureTypes":
		[{"name":"street",
		"id":326,
		"advertiseQuestion":"what is the name of the street?",
		"featureRange":
			{"id":133,
			"values":[],
			"type":"open",
			"openDataType":"null"},
		"multivalue":false},
		{"name":"housenumber",
		"id":324,
		"advertiseQuestion":"what is the house number?",
		"featureRange":
			{"id":133,
			"values":[],
			"type":"open",
			"openDataType":"null"},
		"multivalue":false},
		{"name":"postcode",
		"id":325,
		"advertiseQuestion":"what is the post code?",
		"featureRange":
			{"id":133,"values":[],
			"type":"open",
			"openDataType":"null"},
		"multivalue":false}],
	"featureValues":[],
	"offensive":false,
	"finishAt":-1}
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
	visit.skips = json.skips;
	visit.featureTypes = json.featureTypes;
	visit.featureValues = json.featureValues;
	visit.offensive = json.offensive;
	visit.finishAt = json.finishAt;
	
	return visit;
};