var express = require('express');
var path = require('path');
var favicon = require('static-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
//var mongoose = require('mongoose');
//var configDB = require('./core/database.js');
var session = require('express-session');
var flash    = require('connect-flash');
var passport = require('passport');

var pageController = require('./controllers/PageController');
var userController = require('./controllers/UserController');
var mapController = require('./controllers/MapController');

var app = express();

//mongoose.connect(configDB.url); // connect to our database

require('./core/passport')(passport); // pass passport for configuration

// View engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

// Set up our express application
app.use(favicon());
app.use(logger('dev')); // log every request to the console
app.use(bodyParser.json()); // get information from html forms
app.use(bodyParser.urlencoded());
app.use(cookieParser()); // read cookies (needed for auth)
app.use(express.static(path.join(__dirname, 'public')));
// Set up passport
app.use(session({ secret: 'myurbanopolywebsessionsecret' })); // express session secret
app.use(passport.initialize()); // initialization
app.use(passport.session()); // persistent login sessions
app.use(flash()); // use connect-flash for flash messages stored in session

// ROUTES - Pages (@return - HTML)
app.get('/', pageController.getCover);
app.get('/profile', pageController.getProfile);
app.get('/venues', pageController.getVenues);
app.get('/map',pageController.getMap);
app.get('/leaderboard',pageController.getLeaderboard);
app.get('/notifications',pageController.getNotifications);
app.get('/tutorial',pageController.getTutorial);
app.get('/credits',pageController.getCredits);

// ROUTES - User (@return - redirect)
app.get('/login', userController.logUserIn);
app.get('/logout', userController.logUserOut);
app.get('/auth/facebook', passport.authenticate('facebook', { scope : 'email' }));
app.get('/auth/facebook/callback', passport.authenticate('facebook', {
            successRedirect : '/profile',
            failureRedirect : '/'
        }));

// ROUTES - MapInfo (@return - JSON)
app.get('/retrieveMap', mapController.getMapData);

/// catch 404 and forwarding to error handler
app.use(function(req, res, next) {
    var err = new Error('Not Found');
    err.status = 404;
    next(err);
});

/// error handlers

// development error handler
// will print stacktrace
if (app.get('env') === 'development') {
    app.use(function(err, req, res, next) {
        res.status(err.status || 500);
        res.render('error', {
            message: err.message,
            error: err
        });
    });
}

// production error handler
// no stacktraces leaked to user
app.use(function(err, req, res, next) {
    res.status(err.status || 500);
    res.render('error', {
        message: err.message,
        error: {}
    });
});


module.exports = app;