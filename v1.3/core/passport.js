// core/passport.js

// load all the things we need
var FacebookStrategy = require('passport-facebook').Strategy;

// load up the user model
var userController = require('../controllers/UserController');
var player = require('../models/player');
var pics = [];
var tokens = [];

// load the auth variables
var configAuth = require('./auth');

// expose this function to our app using module.exports
module.exports = function(passport) {

	// =========================================================================
    // passport session setup ==================================================
    // =========================================================================
    // required for persistent login sessions
    // passport needs ability to serialize and unserialize users out of session

    // used to serialize the user for the session
    passport.serializeUser(function(player, done) {
        console.log('serializeUser: ' + player.id);
        done(null, player.id);
    });

    // used to deserialize the user
    passport.deserializeUser(function(id, done) {
        console.log('deserializeUser: ' + id);
        userController.subscribePlayer(id, '', function(err, player){
            player["picture"] = pics[player.id];
            player["token"] = tokens[player.id];
            done(err, player);
        });       
     });

    // =========================================================================
    // FACEBOOK ================================================================
    // =========================================================================
    passport.use(new FacebookStrategy({

        // pull in our app id and secret from our auth.js file
        clientID        : configAuth.facebookAuth.clientID,
        clientSecret    : configAuth.facebookAuth.clientSecret,
        callbackURL     : configAuth.facebookAuth.callbackURL,
        profileFields   : ['id', 'name', 'photos']

    },

    // facebook will send back the token and profile
    function(accessToken, refreshToken, profile, done) {

        // asynchronous
        process.nextTick(function() {

            
            //Once the user is authenticated subscribe
            var playerID = profile.id;
            var playerName = profile.name.givenName + ' ' + profile.name.familyName;

            //Test
            console.log('PROFILE:', profile);
            console.log('ACCESS TOKEN:', accessToken);

            //Profile Picture
            console.log('PHOTOS:',profile.photos[0].value);
            
            userController.subscribePlayer(playerID, playerName, function(err, player){
                console.log('INNER CALLBACK EXECUTED');
                if (err){
                    console.log('ERROR:', err);
                    return done(err);
                }
                // if the user is found, then log them in
                if (player){
                    pics[profile.id] = profile.photos[0].value;
                    tokens[profile.id] = accessToken;
                    console.log('PASSPORT PLAYER: ', player);
                    return done(null, player); 
                }
            });
        });
    }));
};