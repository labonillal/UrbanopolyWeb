// Loading module dependecies
var request = require("request");
var passport = require('passport');
var Utility = require('./Utility');
var Player = require('../models/player');
var venueController = require('./VenueController');

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
  //clean the player visited venues
  venueController.clearPlayerVisitedVenues(req.user.id, function(error, result){
    req.session.destroy(function (err) {
      res.redirect('/');
    });
    console.log('LogOut Sesion: %j', req.user);
    console.log('LogOut Express Sesion: %j', req.session);
  });
};

// facebook authentication and login
exports.authUserFacebookRequest = function(req, res){
  //console.log('Executing: UserController.authUserFacebookRequest...');
  //passport.authenticate('facebook', { scope : 'email' })
};

// handle the callback after facebook has authenticated the user
exports.authUserFacebookCallback = function(req, res){
  //console.log('Executing: UserController.authUserFacebookCallback...');
  //passport.authenticate('facebook', { successRedirect: '/profile',
  //                                    failureRedirect: '/cover' });
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
exports.subscribePlayer = function(playerID, playerName, callback){

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
    method: "GET",
    timeout: 10000,
    json: true
  }, function (error, response, body) {
      if (!error && response.statusCode === 200) {
        var player = Player.parse(body);
        console.log('PlayerID: '+player.id);
        console.log('PlayerName: '+player.name);
        console.log('PlayerCash: '+player.cash);
        callback(null, player);
      }else{
        callback(error);
        console.log("Unable to connect to database server: %j", error);
      }
  })
  // TODO: remove
  console.log('Function subscribePlayer finish...');
  // TODO: remove
};

exports.increaseCash = function(player, deltaCash){
  if(player.cash > -deltaCash){
    player.cash += deltaCash;
      return player.cash;
  }else{
    console.log('ERROR: Player dont have enough cash to buy the venue');
    return null;
  }
};