// Loading module dependecies
var gameController = require('./GameController'); //GameController
var venueController = require('./VenueController');
var notificationsController = require('./NotificationsController');
var Utility = require('./Utility');

/* GET cover page. */
exports.getCover = function(req, res) {
	res.render('cover', { title: 'Urbanopoly' });
};

/* GET Profile page. */
exports.getProfile = function(req, res){
	console.log('Executing: PageController.getProfile...');
	console.log('Sesion: %j', req.user);
	console.log('Express Sesion: %j', req.session);
	res.render('profile', { title: 'Profile', user_name: req.user.name, user_pic: req.user.picture, user_cash: req.user.cash, user_numVenues: req.user.numVenues });
};

/* GET My Venues page. */
exports.getVenues = function(req, res) {
	// Download player venues
	console.log("Download player's venues");
	venueController.downloadMyVenues(req.user.id, function(err, myVenues){
		if (err){
			console.log('ERROR:', err);
			res.send(500, { error: 'Something went wrong' });
		}else{
			console.log('myVenues: %j', myVenues);
			res.render('venues', {	title: 'My Venues',
									venues: myVenues,
						   			user_name: req.user.name,
									user_pic: req.user.picture,
									user_cash: req.user.cash,
									user_numVenues: req.user.numVenues });
		}	
	});
};

/* GET Map page. */
exports.getMap = function(req, res){
	res.render('map', { title: 'Map',
						user_name: req.user.name,
						user_pic: req.user.picture,
						user_cash: req.user.cash,
						user_numVenues: req.user.numVenues,
						categories:  gameController.getAllCategories()});
};

/* GET Leaderboard page. */
exports.getLeaderboard = function(req, res){
	console.log("Loading scores...");
	gameController.getHighscores(req.user.id, 1, 20, function(err, ranking){
		if (err){
			console.log('ERROR:', err);
			res.send(500, { error: 'Something went wrong' });
		}else{
			console.log('leaderboard: %j', ranking);
			res.render('leaderboard', { title: 'Leaderboard',
										leaderboard: ranking,
										user_name: req.user.name,
										user_pic: req.user.picture,
										user_cash: req.user.cash,
										user_numVenues: req.user.numVenues });
		}
	});
};

/* GET Notifications page. */
exports.getNotifications = function(req, res){
	// Download player notifications
	console.log("Download player's notifications");
	notificationsController.loadNotifications(req.user.id, function(err, myNotifications){
		if (err){
			console.log('ERROR:', err);
			res.send(500, { error: 'Something went wrong' });
		}else{
			console.log('myNotifications: %j', myNotifications);
			notificationsController.completeNotifications(myNotifications, function(err, myCompleteNotifications){
				if (err){
					console.log('ERROR:', err);
					res.send(500, { error: 'Something went wrong' });
				}else{
					// TODO: Apply notifications
					//notificationsController.applyNotifications(false, req.user, myNotifications);
					console.log('myCompleteNotifications: %j', myCompleteNotifications);
					res.render('notifications', {	title: 'Notifications',
													notifications: myCompleteNotifications,
								   					user_name: req.user.name,
													user_pic: req.user.picture,
													user_cash: req.user.cash,
													user_numVenues: req.user.numVenues });
				}
			});
		}	
	});
};

/* GET Tutorial page. */
exports.getTutorial = function(req, res){
	res.render('tutorial', { title: 'Tutorial', user_name: req.user.name, user_pic: req.user.picture });
};

/* GET Credits page. */
exports.getCredits = function(req, res){
	res.render('credits', { title: 'Credits', user_name: req.user.name, user_pic: req.user.picture });
};

/* POST Buy Action */
exports.getBuyAction = function(req, res){
	var venue = JSON.parse(req.body.venue);
	var player = req.user;
	var venueCategory = req.body.venueCategory
	var venueName = req.body.venueName;
	var visit = gameController.buyFreeVenue(venue, player, venueCategory, venueName);
	var message = Utility.getMessageBuilder("success", 0, venueName);
	var result = {"visit" : visit, "message" : message, "player": player };
	console.log('RESULT: %j', result);
	res.send(result);
};

/* POST Sell Action */
exports.getSellAction = function(req, res){
	console.log('Function getSellAction starts...');
	console.log('getSellAction VENUE before: ' + req.body.venue);
	var venue = JSON.parse(req.body.venue);
	console.log('getSellAction VENUE after: ' +  venue);
	var player = req.user;
	var visit = gameController.sellVenue(venue, player);
	var message = Utility.getMessageBuilder("success", 1, venue.name);
	var result = {"visit" : visit, "message" : message, "player": player };
	console.log('RESULT: %j', result);
	console.log('Function getSellAction finish...');
	res.send(result);
};

/* GET Mortgage Action */
exports.getMortgageAction = function(req, res){
	var venue = JSON.parse(req.body.venue);
	var player = req.user;
	var visit = gameController.mortgageVenue(venue, player);
	var message = Utility.getMessageBuilder("success", 2, venue.name);
	var result = {"visit" : visit, "message" : message, "player": player };
	console.log('RESULT: %j', result);
	res.send(result);
};

/* GET Redeem Action */
exports.getRedeemAction = function(req, res){
	var venue = JSON.parse(req.body.venue);
	var player = req.user;
	var visit = gameController.redeemMortgagedVenue(venue, player);
	var message = Utility.getMessageBuilder("success", 3, venue.name);
	var result = {"visit" : visit, "message" : message, "player": player };
	console.log('RESULT: %j', result);
	res.send(result);
};

/* GET Pay Action */
exports.getPayAction = function(req, res){
	var result = gameController.payFee(myVenue, myPlayer);
	console.log('RESULT: %j', result);
	res.send(result);
};

/* GET Take Action */
exports.getTakeAction = function(req, res){
	var result = gameController.takeVenue(myVenue, myPlayer, myNewName, myNewCategory);
	console.log('RESULT: %j', result);
	res.send(result);
};

/* GET Quiz Action */
exports.getQuizAction = function(req, res){
	var result = gameController.quiz(myVenue, myPlayer, mySelected, mySkips);
	console.log('RESULT: %j', result);
	res.send(result);
};

/* GET Advertise Action */
exports.getAdvertiseAction = function(req, res){
	var result = gameController.advertise(myVenue, myPlayer, myNewCategory, myNewName, myFeatures, mySkips, myDeltaCash);
	console.log('RESULT: %j', result);
	res.send(result);
};

/* GET Skip Action */
exports.getSkipAction = function(req, res){
	var result = gameController.skip(myVenue, myPlayer);
	console.log('RESULT: %j', result);
	res.send(result);
};

exports.getChildCategories = function(req, res){
	var result = gameController.getChildCategoryOf(req.query.category);
	console.log('RESULT: ', result);
	res.send(result);
};

exports.getCategoryById = function(req, res){
	var result = gameController.getCategoryById(req.query.category);
	console.log('RESULT: ', result);
	res.send(result);
};

exports.getVenueRent = function(req, res){
	var venue = {"value" : req.query.venueValue};
	console.log('VENUE: %j', venue);
	var result = gameController.getFeeToPay(venue);
	console.log('RESULT: ', result);
	res.send(result);
};

exports.getTakeCost = function(req, res){
	var venue = {"value" : req.query.venueValue};
	console.log('VENUE: %j', venue);
	var result = gameController.getTakeCost(venue);
	console.log('RESULT: ', result);
	res.send(result);
};

exports.getVenueDetails = function(req, res){
	var playerId = req.user.id;
	var venueId = req.query.venueId;
	venueController.downloadMyVenues(playerId, function(err, myVenues){
		if (err){
			console.log('ERROR:', err);
			res.send(500, { error: 'Something went wrong' });
		}else{
			for(var i in myVenues){
				var venue = myVenues[i];
				if(venue.id == venueId){
					var venueDetails = myVenues[i];
					var resultRent = gameController.getFeeToPay(venue);
					// Add rent to the details
					venueDetails["rent"] = resultRent.rent;
					console.log('VENUE DETAILS: %j', venueDetails);
				}
			}
			res.send(venueDetails);
		}
	});
};