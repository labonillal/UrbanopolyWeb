/**
 Parse VisitQuiz

	{ "type" : "QUIZ",
	  "player" : "774274788",
	  "venue" : 33912,
	  "date" : null,
	  "deltaMoney" : 0,
	  "sent" : 0,
	  "questions" : ["do wheelchairs have full unrestricted access?(yes/no)"],
	  "skips" : null,
	  "options" : [["yes","no",null,null]],
	  "selected" : [],
	  "feature" : 
		[{	"name":"wheel chair",
			"id":428,
			"advertiseQuestion" : "do wheelchairs have full unrestricted access? (yes/no)",
			"featureRange":
				{"id" : 135,
				 "values" : ["no"],
				 "type" : "closed",
				 "openDataType" : "null"},
			"multivalue":false}],
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
	visit.questions = json.questions;
	visit.skips = json.skips;
	visit.options = json.options;
	visit.selected = json.selected;
	visit.feature = json.feature;
	visit.offensive = json.offensive;
	
	return visit;
};