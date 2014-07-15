// Loading module dependecies
var FB = require('fb');
var gameController = require('./GameController'); //GameController
var gameConf = require("../core/game");
var venueController = require('./VenueController');
var notificationsController = require('./NotificationsController');
var Utility = require('./Utility');

//Local variables
var myQuiz = {"type":"QUIZ","player":"774274788","venue":35289,"date":null,"deltaMoney":0,"sent":0,"questions":["does it sell drugs without prescription? (yes/no)","what\u0027s its cuisine type?","do wheelchairs have full unrestricted access? (yes/no)", "what type of transport is there available?","does it sell drugs without prescription? (yes/no)"],"skips":null,"options":[["yes","no",null,null],["japanese","Brazilian","Chicken","Sandwich"],["no","yes",null,null],["bus","tram","aerialway","monorail"],["yes","no",null,null]],"selected":[],"feature":[{"name":"dispensing","id":363,"advertiseQuestion":"does it sell drugs without prescription? (yes/no)","featureRange":{"id":135,"values":["no"],"type":"closed","openDataType":"null"},"multivalue":false},{"name":"wheel chair","id":428,"advertiseQuestion":"do wheelchairs have full unrestricted access? (yes/no)","featureRange":{"id":135,"values":["yes"],"type":"closed","openDataType":"null"},"multivalue":false}],"offensive":false};

var myAdvertise = {"type":"ADVERTISE","player":"774274788","venue":33912,"date":null,"deltaMoney":0,"sent":0,"venueName":"Valduce","venueCategory":null,"skips":[],"featureTypes":[{"name":"street","id":326,"advertiseQuestion":"what is the name of the street?","featureRange":{"id":133,"values":[],"type":"open","openDataType":"null"},"multivalue":false},{"name":"housenumber","id":324,"advertiseQuestion":"what is the house number?","featureRange":{"id":133,"values":[],"type":"open","openDataType":"null"},"multivalue":false},{"name":"postcode","id":325,"advertiseQuestion":"what is the post code?","featureRange":{"id":133,"values":[],"type":"open","openDataType":"null"},"multivalue":false}],"featureValues":[],"offensive":false,"finishAt":-1};

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
						quiz: myQuiz,
						advertise: myAdvertise,
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
	gameController.buyFreeVenue(venue, player, venueCategory, venueName, function(err, visit){
		console.log('VISIT: ', visit);
		var message;
		var result;
		if(visit){
			message = Utility.getMessageBuilder("success", 0, venueName);
			result = {"visit" : visit, "message" : message, "player": player };
			console.log('RESULT: ', result);
			res.send(result);
		}else{
			message = Utility.getMessageBuilder("error", err.code, venueName);
			console.log('MESSAGE: ', message);
			result = {"visit" : null, "message" : message, "player": player };
			console.log('RESULT: ', result);
			res.send(result);
		}
	});
};

/* POST Sell Action */
exports.getSellAction = function(req, res){
	var venue = JSON.parse(req.body.venue);
	var player = req.user;
	gameController.sellVenue(venue, player, function(err, visit){
		console.log('VISIT: ', visit);
		var message;
		var result;
		if(visit){
			message = Utility.getMessageBuilder("success", 1, venue.name);
			result = {"visit" : visit, "message" : message, "player": player };
			console.log('RESULT: ', result);
			res.send(result);
		}else{
			message = Utility.getMessageBuilder("error", err.code, venueName);
			console.log('MESSAGE: ', message);
			result = {"visit" : null, "message" : message, "player": player };
			console.log('RESULT: ', result);
			res.send(result);
		}
	});
};

/* GET Mortgage Action */
exports.getMortgageAction = function(req, res){
	var venue = JSON.parse(req.body.venue);
	var player = req.user;
	gameController.mortgageVenue(venue, player, function(err, visit){
		console.log('VISIT: ', visit);
		var message;
		var result;
		if(visit){
			message = Utility.getMessageBuilder("success", 2, venue.name);
			result = {"visit" : visit, "message" : message, "player": player };
			console.log('RESULT: ', result);
			res.send(result);
		}else{
			message = Utility.getMessageBuilder("error", err.code, venueName);
			console.log('MESSAGE: ', message);
			result = {"visit" : null, "message" : message, "player": player };
			console.log('RESULT: ', result);
			res.send(result);
		}
	});
};

/* GET Redeem Action */
exports.getRedeemAction = function(req, res){
	var venue = JSON.parse(req.body.venue);
	var player = req.user;
	gameController.redeemMortgagedVenue(venue, player, function(err, visit){
		console.log('VISIT: ', visit);
		var message;
		var result;
		if(visit){
			message = Utility.getMessageBuilder("success", 3, venue.name);
			result = {"visit" : visit, "message" : message, "player": player };
			console.log('RESULT: ', result);
			res.send(result);
		}else{
			message = Utility.getMessageBuilder("error", err.code, venueName);
			console.log('MESSAGE: ', message);
			result = {"visit" : null, "message" : message, "player": player };
			console.log('RESULT: ', result);
			res.send(result);
		}
	});
};

/* GET Pay Action */
exports.getPayAction = function(req, res){
	var venue = JSON.parse(req.body.venue);
	var player = req.user;
	gameController.payFee(venue, player, function(err, visit){
		console.log('VISIT: ', visit);
		var message;
		var result;
		if(visit){
			message = Utility.getMessageBuilder("success", 4, venue.name);
			result = {"visit" : visit, "message" : message, "player": player };
			console.log('RESULT: ', result);
			res.send(result);
		}else{
			message = Utility.getMessageBuilder("error", err.code, venueName);
			console.log('MESSAGE: ', message);
			result = {"visit" : null, "message" : message, "player": player };
			console.log('RESULT: ', result);
			res.send(result);
		}
	});
};

/* GET Take Action */
exports.getTakeAction = function(req, res){
	var venue = JSON.parse(req.body.venue);
	var player = req.user;
	var venueCategory = req.body.venueCategory
	var venueName = req.body.venueName;
	gameController.takeVenue(venue, player, venueName, venueCategory, function(err, visit){
		console.log('VISIT: ', visit);
		var message;
		var result;
		if(visit){
			message = Utility.getMessageBuilder("success", 5, venueName);
			result = {"visit" : visit, "message" : message, "player": player };
			console.log('RESULT: ', result);
			res.send(result);
		}else{
			message = Utility.getMessageBuilder("success", 5, venueName);
			result = {"visit" : visit, "message" : message, "player": player };
			console.log('RESULT: ', result);
			res.send(result);
		}
	});
};

/* GET Quiz Action */
exports.getQuizAction = function(req, res){
	console.log('getQuizAction starts...');
	var venue = JSON.parse(req.body.venue);
	var player = req.user;
	var selected = req.body.selected;
	console.log('selected', selected);
	var skips = req.body.skips;
	console.log('skips', skips);
	gameController.quiz(venue, player, selected, skips, function(err, visit){
		console.log('VISIT: ', visit);
		var message;
		var result;
		if(visit){
			message = Utility.getMessageBuilder("success", 7, venue.name);
			result = {"visit" : visit, "message" : message, "player": player };
			console.log('RESULT: ', result);
			res.send(result);
		}else{
			message = Utility.getMessageBuilder("success", 5, venueName);
			result = {"visit" : visit, "message" : message, "player": player };
			console.log('RESULT: ', result);
			res.send(result);
		}
	});

};

/* GET Advertise Action */
exports.getAdvertiseAction = function(req, res){
	console.log('getAdvertiseAction starts...');
	var venue = JSON.parse(req.body.venue);
	var player = req.user;
	var venueCategory = req.body.venueCategory
	var venueName = req.body.venueName;
	var features = req.body.featureValues;
	console.log('features: ', features);
	var skips = req.body.skips;
	console.log('skips: ', skips);
	var ranges = req.body.featureRanges;
	console.log('ranges: ', ranges);
	var moneyForQuestions = 0;
	//Calculate earned money
	for(var i=0; i<ranges.length;i++){
		if(skips[i] == 'false' && ranges[i] == 'open'){
			moneyForQuestions += parseInt(gameConf.moneyForAdvertiseOpen);
		}else if(skips[i] == 'false' && ranges[i] == 'semiclosed'){
			moneyForQuestions += parseInt(gameConf.moneyForAdvertiseSemiclosed);
		}else if(skips[i] == 'false' && ranges[i] == 'closed'){
			moneyForQuestions += parseInt(gameConf.moneyForAdvertiseClosed);
		}
	}
	gameController.advertise(venue, player, venueCategory, venueName, features, skips, moneyForQuestions, function(err, visit){
		console.log('VISIT: ', visit);
		var message;
		var result;
		if(visit){
			message = Utility.getMessageBuilder("success", 6, moneyForQuestions);
			result = {"visit" : visit, "message" : message, "player": player };
			console.log('RESULT: ', result);
			res.send(result);
		}else{
			message = Utility.getMessageBuilder("success", 5, venueName);
			result = {"visit" : visit, "message" : message, "player": player };
			console.log('RESULT: ', result);
			res.send(result);
		}
	});
};

/* GET Skip Action */
exports.getSkipAction = function(req, res){
	var venue = JSON.parse(req.body.venue);
	var player = req.user;
	gameController.skip(venue, player, function(err, visit){
		console.log('VISIT: ', visit);
		var message;
		var result;
		if(visit){
			message = Utility.getMessageBuilder("success", 8, gameConf.moneyForSkip);
			result = {"visit" : visit, "message" : message, "player": player };
			console.log('RESULT: ', result);
			res.send(result);
		}else{
			message = Utility.getMessageBuilder("success", 5, venueName);
			result = {"visit" : visit, "message" : message, "player": player };
			console.log('RESULT: ', result);
			res.send(result);
		}
	});
};

/* Share on facebook Action*/
exports.getShare = function(req, res){
	FB.setAccessToken(req.user.token);

	var FbMessage = 'I just have a great time playing Urbanopoly!. Try it yourself on http://swa.cefriel.it/urbangames/urbanopoly/index.html';
	FB.api('me/feed', 'post', { message: FbMessage}, function (res) {
	  if(!res || res.error) {
	    console.log(!res ? 'error occurred' : res.error);
	    return;
	  }
	  console.log('Facebook Post Id: ' + res.id);
	});

}

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