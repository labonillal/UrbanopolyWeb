/* Loading Module Dependencies */
var request = require("request");
var fs = require("fs");
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

/* Method to get the current date*/
exports.getCurrentDate = function(){
    var currentDate = new Date();
    var dd = currentDate.getDate(); // Day
    var mm = currentDate.getMonth()+1; // Month -> +1 because January is 0!
    var yyyy = currentDate.getFullYear(); // Year

    // To get the format 01, 02, 03, ...
    if(dd < 10) {
        dd = '0' + dd;
    } 
    // To get the format 01, 02, 03, ...
    if(mm<10) {
        mm = '0' + mm;
    }
    // To get years before 1000
    if(yyyy < 1000){
        yyyy = yyyy + 1900;
    }

    currentDate = dd + '/' + mm + '/' + yyyy; // Format dd/mm/yyyy

    return currentDate;
};

/* Method to load content from a file*/
exports.loadContentFromFile = function(filePath, callback){
    fs.readFile(filePath, function(err, data) {
        if(err){
            callback(err);
        }
        else{
            var linesArray = data.toString().split("\n");
            callback(null, linesArray);
        }
    });
};

/* Method to get an error object */
exports.getMessageBuilder = function(type, code, venueName){
    var message = {"type" : "", "code" : "", "text" : "" };
    //Success type
    if(type == 'success'){
        message.type = type;
        switch(code) {
            case 0:
                //Buy venue
                message.code = code;
                message.text = 'You bought ' + venueName + '. Would you like to share the purchasing on facebook?.';
                break;
            case 1:
                //Sell venue
                message.code = code;
                message.text = 'Venue Sold ' + venueName + ' has been sold';
                break;
            case 2:
                //Mortgage venue
                message.code = code;
                message.text = 'Venue Mortgaged ' + venueName + ' has been mortgaged, you got 50% of its value from the bank, don\'t forget to redeem it by tomorrow!.';
                break;
            case 3:
                //Redeem venue
                message.code = code;
                message.text = 'Mortgage Redeemed ' + venueName + ' is yours again, congratulations!.';
                break;
            case 4:
                //Daily bonus
                message.code = code;
                message.text = 'You earned ' + venueName + ' €.';
                break;
            default:
                console.log('Default block executed');
        }
        return message;
    }
    //Error type
    else{
        message.type = type;
        switch(code) {
            case 0:
                //InternalServerErrorException
                message.code = code;
                message.text = 'Oh snap!. '+'Internal server error... please contact the system administrator.';
                break;
            case 1:
                //IsFreeException
                message.code = code;
                message.text = 'The venue is free!. ' + 'In the meantime the owner sells the venue.';
                break;
            case 2:
                //IsNotFreeException
                message.code = code;
                message.text = 'The venue is not free!. ' + 'In the meantime someone buys the venue.';
                break;
            case 3:
                //NotEnoughMoneyException
                message.code = code;
                message.text = 'You don\'t have enough money!. ' + 'Would you like to mortgage or sell some venues?.';
                break;
            case 4:
                //OwnerChangedException
                message.code = code;
                message.text = 'Owner changed! ' + venueName + '. In the meantime someone has taken your venue.';
                break;
            case 5:
                //AlreadyMortgagedException
                message.code = code;
                message.text = venueName + ' has been already mortgaged!. ' + 'Please, try to reload venue\'s information.';
                break;
            case 6:
                //AlreadyRedeemedException
                message.code = code;
                message.text = venueName + ' has been already redeemed!. ' + 'Please, try to reload venue\'s information.';
                break;
            default:
                console.log('Default block executed');
        }
        return message;
    }
};

exports.formatDate = function(jsonDate){
    var dd = jsonDate.dayOfMonth;
    var mm = jsonDate.month;
    var yyyy = jsonDate.year;
    var hr = jsonDate.hourOfDay;
    var min = jsonDate.minute;
    var seg = jsonDate.second;

    // To get the format 01, 02, 03, ...
    if(dd < 10) {
        dd = '0' + dd;
    } 
    // To get the format 01, 02, 03, ...
    if(mm < 10) {
        mm = '0' + mm;
    }
    // To get years before 1000
    if(yyyy < 1000){
        yyyy = yyyy + 1900;
    }
    // To get the format 01, 02, 03, ...
    if(hr < 10) {
        hr = '0' + hr;
    }
    // To get the format 01, 02, 03, ...
    if(min < 10) {
        min = '0' + min;
    }
    // To get the format 01, 02, 03, ...
    if(seg < 10) {
        seg = '0' + seg;
    }

    var formattedDate = dd + '/' + mm + '/' + yyyy + ' ' + hr + ':' + min + ':' + seg; //Format dd/mm/yyyy hr:min:seg

    return formattedDate;
};