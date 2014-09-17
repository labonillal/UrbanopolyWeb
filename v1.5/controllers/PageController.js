//
// UrbanopolyWeb v1.5.0
// 
// Copyright (c) 2012-2014, CEFRIEL
// Licensed under the Apache 2.0 License.
//

// Loading module dependecies
var FB = require('fb');
var formidable = require('formidable');
var util = require('util');
var fs = require('fs');
var gm = require('gm').subClass({ imageMagick: true });
var gameController = require('./GameController'); //GameController
var gameConf = require("../core/game");
var venueController = require('./VenueController');
var notificationsController = require('./NotificationsController');
var Utility = require('./Utility');

/* GET cover page. */
exports.getCover = function(req, res) {
	res.render('cover', { title: 'Urbanopoly' });
};

/* GET Profile page. */
exports.getProfile = function(req, res){
	//console.log('Executing: PageController.getProfile...');
	//console.log('Sesion: %j', req.user);
	//console.log('Express Sesion: %j', req.session);
	var userCash = Utility.formatCurrency(req.user.cash);
	res.render('profile', { title: 'Profile', user_name: req.user.name, user_pic: req.user.picture, user_cash: userCash, user_numVenues: req.user.numVenues });
};

/* GET My Venues page. */
exports.getVenues = function(req, res) {
	// Download player venues
	console.log("Download player's venues");
	var userCash = Utility.formatCurrency(req.user.cash);
	venueController.downloadMyVenues(req.user.id, function(err, myVenues, myVisits){
		if (err){
			console.log('ERROR:', err);
			res.send(500, { error: 'Something went wrong' });
		}else{
			for(var i in myVenues){
				var venueFormat = myVenues[i];
				venueFormat.value = Utility.formatCurrency(venueFormat.value);
			}
			res.render('venues', {	title: 'My Venues',
									venues: myVenues,
									visits: myVisits,
						   			user_name: req.user.name,
									user_pic: req.user.picture,
									user_cash: userCash,
									user_numVenues: req.user.numVenues });
		}	
	});
};

/* GET Map page. */
exports.getMap = function(req, res){
	var userCash = Utility.formatCurrency(req.user.cash);
	res.render('map', { title: 'Map',
						user_name: req.user.name,
						user_pic: req.user.picture,
						user_cash: userCash,
						user_numVenues: req.user.numVenues,
						categories:  gameController.getAllCategories()});
};

/* GET Leaderboard page. */
exports.getLeaderboard = function(req, res){
	console.log("Loading scores...");
	var userCash = Utility.formatCurrency(req.user.cash);
	gameController.getHighscores(req.user.id, 1, 10, function(err, ranking){
		if (err){
			console.log('ERROR:', err);
			res.send(500, { error: 'Something went wrong' });
		}else{
			var playerEntry;
			var myCustomRanking = [];
			for(var i in ranking){
				if(ranking[i].playerId == req.user.id){
					playerEntry = ranking[i];
				}
			}

			if(playerEntry.rank >= 10){
				for(var i in ranking){
					if(ranking[i].rank <= 3){
						myCustomRanking.push(ranking[i]);
					}else if(playerEntry.rank - ranking[i].rank >= 0 && playerEntry.rank - ranking[i].rank <= 3){
						myCustomRanking.push(ranking[i]);
					}else if(ranking[i].rank - playerEntry.rank > 0 && ranking[i].rank - playerEntry.rank <= 3){
						myCustomRanking.push(ranking[i]);
					}
				}
				ranking = myCustomRanking;
			}

			for(var i in ranking){
				var entryFormat = ranking[i];
				entryFormat.Money = Utility.formatCurrency(entryFormat.Money);
				entryFormat.heritage = Utility.formatCurrency(entryFormat.heritage);
			}
			res.render('leaderboard', { title: 'Leaderboard',
										leaderboard: ranking,
										user_name: req.user.name,
										user_pic: req.user.picture,
										user_cash: userCash,
										user_numVenues: req.user.numVenues });
		}
	});
};

/* GET Notifications page. */
exports.getNotifications = function(req, res){
	// Download player notifications
	console.log("Download player's notifications");
	var userCash = Utility.formatCurrency(req.user.cash);
	notificationsController.loadNotifications(req.user.id, function(err, myNotifications){
		if (err){
			console.log('ERROR:', err);
			res.send(500, { error: 'Something went wrong' });
		}else{
			//console.log('myNotifications: %j', myNotifications);
			notificationsController.completeNotifications(myNotifications, function(err, myCompleteNotifications){
				if (err){
					console.log('ERROR:', err);
					res.send(500, { error: 'Something went wrong' });
				}else{
					// TODO: Apply notifications
					//notificationsController.applyNotifications(false, req.user, myNotifications);
					//console.log('myCompleteNotifications: %j', myCompleteNotifications);
					for(var i in myCompleteNotifications){
						var notificationFormat = myCompleteNotifications[i];
						notificationFormat.deltaCash = Utility.formatCurrency(notificationFormat.deltaCash);
					}
					res.render('notifications', {	title: 'Notifications',
													notifications: myCompleteNotifications,
								   					user_name: req.user.name,
													user_pic: req.user.picture,
													user_cash: userCash,
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
		//console.log('VISIT: ', visit);
		var message;
		var result;
		if(visit){
			message = Utility.getMessageBuilder("success", 0, venueName);
			result = {"visit" : visit, "message" : message, "player": player };
			//console.log('RESULT: ', result);
			res.send(result);
		}else{
			message = Utility.getMessageBuilder("error", err.code, venueName);
			//console.log('MESSAGE: ', message);
			result = {"visit" : null, "message" : message, "player": player };
			//console.log('RESULT: ', result);
			res.send(result);
		}
	});
};

/* POST Sell Action */
exports.getSellAction = function(req, res){
	var venue = JSON.parse(req.body.venue);
	var player = req.user;
	gameController.sellVenue(venue, player, function(err, visit){
		//console.log('VISIT: ', visit);
		var message;
		var result;
		if(visit){
			message = Utility.getMessageBuilder("success", 1, venue.name);
			result = {"visit" : visit, "message" : message, "player": player };
			//console.log('RESULT: ', result);
			res.send(result);
		}else{
			message = Utility.getMessageBuilder("error", err.code, venueName);
			console.log('MESSAGE: ', message);
			result = {"visit" : null, "message" : message, "player": player };
			//console.log('RESULT: ', result);
			res.send(result);
		}
	});
};

/* GET Mortgage Action */
exports.getMortgageAction = function(req, res){
	var venue = JSON.parse(req.body.venue);
	var player = req.user;
	gameController.mortgageVenue(venue, player, function(err, visit){
		//console.log('VISIT: ', visit);
		var message;
		var result;
		if(visit){
			message = Utility.getMessageBuilder("success", 2, venue.name);
			result = {"visit" : visit, "message" : message, "player": player };
			//console.log('RESULT: ', result);
			res.send(result);
		}else{
			message = Utility.getMessageBuilder("error", err.code, venueName);
			//console.log('MESSAGE: ', message);
			result = {"visit" : null, "message" : message, "player": player };
			//console.log('RESULT: ', result);
			res.send(result);
		}
	});
};

/* GET Redeem Action */
exports.getRedeemAction = function(req, res){
	var venue = JSON.parse(req.body.venue);
	var player = req.user;
	gameController.redeemMortgagedVenue(venue, player, function(err, visit){
		//console.log('VISIT: ', visit);
		var message;
		var result;
		if(visit){
			message = Utility.getMessageBuilder("success", 3, venue.name);
			result = {"visit" : visit, "message" : message, "player": player };
			//console.log('RESULT: ', result);
			res.send(result);
		}else{
			message = Utility.getMessageBuilder("error", err.code, venueName);
			//console.log('MESSAGE: ', message);
			result = {"visit" : null, "message" : message, "player": player };
			//console.log('RESULT: ', result);
			res.send(result);
		}
	});
};

/* GET Pay Action */
exports.getPayAction = function(req, res){
	var venue = JSON.parse(req.body.venue);
	var player = req.user;
	gameController.payFee(venue, player, function(err, visit){
		//console.log('VISIT: ', visit);
		var message;
		var result;
		if(visit){
			message = Utility.getMessageBuilder("success", 4, venue.name);
			result = {"visit" : visit, "message" : message, "player": player };
			//console.log('RESULT: ', result);
			res.send(result);
		}else{
			message = Utility.getMessageBuilder("error", err.code, venueName);
			//console.log('MESSAGE: ', message);
			result = {"visit" : null, "message" : message, "player": player };
			//console.log('RESULT: ', result);
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
		//console.log('VISIT: ', visit);
		var message;
		var result;
		if(visit){
			message = Utility.getMessageBuilder("success", 5, venueName);
			result = {"visit" : visit, "message" : message, "player": player };
			//console.log('RESULT: ', result);
			res.send(result);
		}else{
			message = Utility.getMessageBuilder("error", err.code, venueName);
			result = {"visit" : null, "message" : message, "player": player };
			//console.log('RESULT: ', result);
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
	//console.log('selected', selected);
	var skips = req.body.skips;
	//console.log('skips', skips);
	gameController.quiz(venue, player, selected, skips, function(err, visit){
		//console.log('VISIT: ', visit);
		var message;
		var result;
		if(visit){
			message = Utility.getMessageBuilder("success", 7, Utility.formatCurrency(visit.deltaMoney));
			result = {"visit" : visit, "message" : message, "player": player };
			//console.log('RESULT: ', result);
			res.send(result);
		}else{
			message = Utility.getMessageBuilder("error", err.code, venue.name);
			result = {"visit" : null, "message" : message, "player": player };
			//console.log('RESULT: ', result);
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
	//console.log('features: ', features);
	var skips = req.body.skips;
	//console.log('skips: ', skips);
	var ranges = req.body.featureRanges;
	//console.log('ranges: ', ranges);
	var moneyForQuestions = 0;
	//Calculate earned money on questions
	for(var i=0; i<ranges.length;i++){
		if(skips[i] == 'false' && ranges[i] == 'open'){
			moneyForQuestions += parseInt(gameConf.moneyForAdvertiseOpen);
			console.log('Advertise open question');
		}else if(skips[i] == 'false' && ranges[i] == 'semiclosed'){
			moneyForQuestions += parseInt(gameConf.moneyForAdvertiseSemiclosed);
			console.log('Advertise semi closed question');
		}else if(skips[i] == 'false' && ranges[i] == 'closed'){
			moneyForQuestions += parseInt(gameConf.moneyForAdvertiseClosed);
			console.log('Advertise closed question');
		}
	}
	//If the photo was taken add the bonus
	if(skips[ranges.length] == 'false'){
		moneyForQuestions += parseInt(gameConf.moneyForAdvertiseOpen);
		console.log('Advertise photo taken');
	}
	gameController.advertise(venue, player, venueCategory, venueName, features, skips, moneyForQuestions, function(err, visit){
		console.log('VISIT: ', visit);
		var message;
		var result;
		if(visit){
			message = Utility.getMessageBuilder("success", 6, Utility.formatCurrency(moneyForQuestions));
			result = {"visit" : visit, "message" : message, "player": player };
			//console.log('RESULT: ', result);
			res.send(result);
		}else{
			message = Utility.getMessageBuilder("error", err.code, venueName);
			result = {"visit" : null, "message" : message, "player": player };
			//console.log('RESULT: ', result);
			res.send(result);
		}
	});
};

/* GET Skip Action */
exports.getSkipAction = function(req, res){
	var venue = JSON.parse(req.body.venue);
	var player = req.user;
	gameController.skip(venue, player, function(err, visit){
		//console.log('VISIT: ', visit);
		var message;
		var result;
		if(visit){
			message = Utility.getMessageBuilder("success", 8, gameConf.moneyForSkip);
			result = {"visit" : visit, "message" : message, "player": player };
			//console.log('RESULT: ', result);
			res.send(result);
		}else{
			message = Utility.getMessageBuilder("error", err.code, venue.name);
			result = {"visit" : null, "message" : message, "player": player };
			//console.log('RESULT: ', result);
			res.send(result);
		}
	});
};

/* Upload photo Action*/
exports.getUploadAction = function(req, res){
	console.log('getUploadAction starts...');
	var venueId = req.query.venueId;
	console.log('VenueID: ', venueId);
	var playerId = req.user.id;
	console.log('PlayerID: ', playerId);
	var form = new formidable.IncomingForm();
	//form.keepExtensions = true;
	form.parse(req, function(err, fields, files){
		res.writeHead(200, {'content-type': 'text/plain'});
		res.write('received upload:\n\n');
		res.end(util.inspect({fields: fields, files: files}));
	});

	form.on('end', function(fields, files){
		// Temporary location of our uploaded file
		var temp_path = this.openedFiles[0].path;
		console.log('temp_path: ', temp_path);
		// The file name of the uploaded file
		var file_name = this.openedFiles[0].name;
		console.log('file_name: ', file_name);
		file_name = file_name.replace(/\.[^/.]+$/, "");
		// Location where we want to copy the uploaded file
		var new_location = 'uploads/' + file_name + '.jpeg';
		console.log('new_location: ', new_location);
		//Compression to jpeg
		gm(temp_path)
			.compress('JPEG')
			.noProfile()
			.write(temp_path + '.jpeg', function (err) {
				if(err){
					console.log('ERROR: ', err);
				}else{
					console.log('File converted to JPEG');
					// Reading the file using the FS
					fs.readFile(temp_path + '.jpeg', function(err, data) {
						if(err){
							console.log('ERROR: ', err);
						}else{
							//Upload the photo on jpeg
							venueController.uploadPhoto(data, venueId, playerId, function(err, result){
								if(result){
									console.log('getUploadAction RESULT: ', result);
								}else{
									console.log('getUploadAction ERROR: ', err);
								}
							});
						}
					});
				}
			});
	});
	console.log('getUploadAction finish...');
}

/* Upload photo Action*/
exports.getJudgeAction = function(req, res){
	console.log('getJudgeAction starts...');
	var venue = JSON.parse(req.body.venue);
	//console.log('VENUE: ', venue);
	var photoRank = venue.posters[0].photoRank;
	var player = req.user;
	var venueCategory = venue.category.id;
	var venueName = venue.name;
	var featureValues = venue.posters[0].featureValues;
	var offensive = venue.posters[0].offensive;
	gameController.judge(venue, photoRank, player, venueCategory, venueName, featureValues, offensive, function(err, visit){
		console.log('VISIT: ', visit);
		var message;
		var result;
		if(visit){
			message = Utility.getMessageBuilder("success", 8, Utility.formatCurrency(visit.deltaMoney));
			result = {"visit" : visit, "message" : message, "player": player };
			console.log('RESULT: ', result);
			res.send(result);
		}else{
			message = Utility.getMessageBuilder("error", err.code, venue.name);
			result = {"visit" : null, "message" : message, "player": player };
			console.log('RESULT: ', result);
			res.send(result);
		}
	});
	console.log('getJudgeAction finish...');
}

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
};

exports.getChildCategories = function(req, res){
	var result = gameController.getChildCategoryOf(req.query.category);
	//console.log('RESULT: ', result);
	res.send(result);
};

exports.getCategoryById = function(req, res){
	var result = gameController.getCategoryById(req.query.category);
	//console.log('RESULT: ', result);
	res.send(result);
};

exports.getVenueRent = function(req, res){
	var venue = {"value" : req.query.venueValue};
	//console.log('VENUE: %j', venue);
	var result = gameController.getFeeToPay(venue);
	//console.log('RESULT: ', result);
	res.send(result);
};

exports.getTakeCost = function(req, res){
	var venue = {"value" : req.query.venueValue};
	//console.log('VENUE: %j', venue);
	var result = gameController.getTakeCost(venue);
	//console.log('RESULT: ', result);
	res.send(result);
};

exports.getVenueDetails = function(req, res){
	var playerId = req.user.id;
	var venueId = req.query.venueId;
	var posterCollection = [];
	venueController.downloadMyVenues(playerId, function(err, myVenues, myVisits){
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
					for(var j in myVisits){
						var visit = myVisits[j];
						if(venue.id == visit.venue && visit.type == 'JUDGE'){
							if(visit.idPhoto != null){
								//Build the path of the poster photo
								var photoPath = Utility.getServerAddress() + '/' + gameConf.photosFolderName + '/' + visit.idPhoto + gameConf.photoNameSuffix;
								visit["idPhoto"] = photoPath;
							}
							posterCollection.push(visit);
						}
					}
					// Add posters to the details
					venueDetails["posters"] = posterCollection;
					console.log('VENUE DETAILS: %j', venueDetails);
				}
			}
			res.send(venueDetails);
		}
	});
};

exports.getPlayerAlreadyVisited = function(req, res){
	var playerId = req.user.id;
	venueController.getAlreadyVisitedVenues(playerId, function(err, alreadyVisitedVenues){
		if (err){
			console.log('ERROR:', err);
			res.send(500, { error: 'Something went wrong' });
		}else{
			res.send(alreadyVisitedVenues);
		}
	});
};