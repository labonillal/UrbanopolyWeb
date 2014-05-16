/* Loading Module Dependencies */
var gameConf = require("../core/game");
var request = require("request");
var userController = require('./UserController');
var Utility = require('./Utility');

// Local variables
var servicePlayArea = "GetPlayArea";

// Retrieves the game area
exports.downloadArea = function(req, res, lat, lon){

	// Prepare a request object
	var str = "{0}/{1}?uid={2}&lat={3}&lon={4}&maxDist={5}";
	var requestUrl = str.format(Utility.getServerAddress(), servicePlayArea, req.user.id, lat, lon, gameConf.maxDistance);
	console.log("PLAYER: %j", req.user.id);
	console.log("REQUEST_URL: %j", requestUrl);

	// Request to retrieve game area info from url
  	request({
    	url: requestUrl,
    	method: "GET",
    	timeout: 10000,
    	json: true
  	}, function (error, response, body) {
    	if (!error && response.statusCode === 200) {
          console.log(body);
          return body;
      	}else{
        	console.log("Unable to connect to database server: %j", error);
          return null;
      	}
  	})
};