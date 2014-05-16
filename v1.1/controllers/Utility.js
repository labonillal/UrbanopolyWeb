/* Loading Module Dependencies */
var request = require("request");
var gameConf = require("../core/game");

/* Method to provide String.format support to JavaScript */
String.prototype.format = function(){
    var args = arguments;
    args['{'] = '{';
    args['}'] = '}';
    return this.replace(
        /{({|}|-?[0-9]+)}/g,
        function(item) {
            var result = args[item.substring(1, item.length - 1)];
            return typeof result == 'undefined' ? '' : result;
            }
        );
};

/* Method to get the server address*/
exports.getServerAddress = function(){
	return gameConf.localhostServerUrl;
    //return gameConf.cefrielServerUrl;
};

/* Method to request JSON data using a URL */
exports.getStringResponse = function (requestURL){
    console.log('Function getStringResponse Starts...');
	request({
    url: requestURL,
    json: true
	}, function (error, response, body) {

    	if (!error && response.statusCode === 200) {
            console.log(body); // Print the response
            console.log('Function getStringResponse Finish...');
            return body;
    	}else{
            console.log(error);
        }
	})	
};