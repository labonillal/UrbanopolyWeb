// Loading module dependecies
var request = require("request");
var passport = require('passport');
var Utility = require('./Utility');
var Player = require('../models/player');

// Local variables
var serviceSuscribe = "PlayerSubscribe";

// Starts the registration process by invoking <authUserFacebookRequest>
exports.logUserIn = function(req, res){
  console.log('Executing: UserController.logUserIn...');
	res.redirect('/auth/facebook');
};

// Terminates the current active session
exports.logUserOut = function(req, res){
  console.log('Executing: UserController.logUserOut...');
  req.logout();
	res.redirect('/');
};

// Create player session values
exports.createSession = function(req, res, player){
  req.session.player = {
    player_id: player.id,
    player_name : player.name,
    player_cash : player.cash
  };
};

// Suscribe player
exports.subscribePlayer = function(playerID, playerName){

  // TODO: remove
  console.log('Function subscribePlayer starts...');
  // TODO: remove

  var encodedPlayerID;
  var encodedPlayerName;
  try{
    encodedPlayerID = encodeURIComponent(playerID);
    encodedPlayerName = encodeURIComponent(playerName);
  }catch(err){
    console.log('Unable to encode player ID or Name');
  }

  var str = "{0}/{1}?uid={2}&playername={3}";
  var requestUrl = str.format(Utility.getServerAddress(), serviceSuscribe, encodedPlayerID, encodedPlayerName);

  //var str = "{0}/{1}?uid={2}&lat={3}&lon={4}&maxDist={5}";
  //var requestUrl = str.format(Utility.getServerAddress(), "GetPlayArea", "Scrooge", "45.480265", "9.223666", "0.2");

  // TODO: remove
  console.log('Formatted URL: ' + requestUrl);
  // TODO: remove

  // Request to retrieve player info from url
  request({
    url: requestUrl,
    json: true
  }, function (error, response, body) {
      if (!error && response.statusCode === 200) {
        var player = Player.parse(body);
        console.log('PlayerID: '+player.id);
        console.log('PlayerName: '+player.name);
        console.log('PlayerCash: '+player.cash);
        return player;
      }else{
        console.log(error);
      }
  })
  // TODO: remove
  console.log('Function subscribePlayer finish...');
  // TODO: remove
};