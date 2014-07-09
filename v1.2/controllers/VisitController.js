/* Loading Module Dependencies */
var request = require('request');
var Utility = require('./Utility'); //UtilityController

// Local variables
var serviceVisit = "SetVisits";
var inVisits = [];
var outVisits = [];

// Retrives visits corresponding to the venue of type QUIZ and not sent
exports.getVisitQuiz = function(venue){
	for(var i = inVisits.length; i > 0; i--){
		if(inVisits[i].venue == venue.id && inVisits[i].type == 'QUIZ' && inVisits[i].sent != true){
			return inVisits[i];
		}
	return null;
	}
};

// Retrives visits corresponding to the venue of type ADVERTISE and not sent
exports.getVisitAdvertise = function(venue){
	for(var i = inVisits.length; i > 0; i--){
		if(inVisits[i].venue == venue.id && inVisits[i].type == 'ADVERTISE' && inVisits[i].sent != true){
			return inVisits[i];
		}
	return null;
	}
};

// Add element to outVisits array
exports.addOutVisit = function(visit){
	console.log('Function addOutVisit start');
	outVisits.push(visit);
};

// Remove element from outVisits array
exports.deleteVisit = function(visit){
	console.log('Function deleteVisit start');
	var index = outVisits.indexOf(visit);
	if(index > -1){
		outVisits.splice(index, 1);
	}
};

// Send Visits
exports.sendVisits = function(callback){
	console.log('Function sendVisits start');
	console.log('outVisits length: %j', outVisits.length);
	// Iterate over the array sending the visits
	var visitsToSend = [];
	var jsonVisits;
	for (var i = 0;i < outVisits.length;i++){
		if(outVisits[i].sent != true){
			visitsToSend.push(outVisits[i]);
		}
	}

	jsonVisits = JSON.stringify(visitsToSend);
	console.log('VISITS TO SEND:');
	console.log(jsonVisits);

	// Prepare a request object
	var str = "{0}/{1}";
	var requestUrl = str.format(Utility.getServerAddress(), serviceVisit);
	console.log('Formatted URL: ', requestUrl);

	// Request to retrieve game area info from url
  	request.post({
    	url: requestUrl,
    	method: "POST",
    	body: jsonVisits,
    	timeout: 10000
  	}, function (error, response, body) {
    	if (!error && response.statusCode === 200) {
    		for(var j = 0;j < visitsToSend.length;j++){
		        visitsToSend[j].sent = true;
		    }
    		console.log('RESPONSE: ', response.statusCode);
    		console.log('Function sendVisits finish');
    		callback(null, response.statusCode);
    	}
    	else{
    		console.log('Unable to send the visits: %j', error);
    		console.log('Function sendVisits finish');
    		callback(error);
    	}
 	})   
};