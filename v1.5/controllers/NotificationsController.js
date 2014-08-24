// Load module dependencies
var request = require("request");
var Notification = require('../models/notification');
var userController = require('./UserController');
var Utility = require('./Utility');

// Local variables
var serviceNotification = "GetNotifications";

exports.loadNotifications = function(playerId, callback){
	console.log('Function loadNotifications start...');
	var notificationsCollection = [];
	var str = "{0}/{1}?uid={2}";
  	var requestUrl = str.format(Utility.getServerAddress(), serviceNotification, playerId);

	console.log("PLAYER: %j", playerId);
	console.log("REQUEST_URL: %j", requestUrl);

	// Request to retrieve the venues of the player
	request({
		url: requestUrl,
		method: "GET",
		timeout: 10000
	}, function (error, response, data) {
		if (!error && response.statusCode === 200) {
			console.log('DATA: ' + data)
			//Parse server response object
			// TODO: Uncomment and delete test data
			var reply = JSON.parse(data);
			/**var reply = [{	"deltaCash":64487,
										"type":"DAILY_BONUS",
										"venue":null,
										"id":119901,
										"venueName":"with no name",
										"date":{"year":2014,"month":5,"dayOfMonth":14,"hourOfDay":0,"minute":0,"second":7}},
									 {	"deltaCash":0,
									 	"type":"LOSE_MORTGAGED_VENUE",
									 	"venue":35444,
									 	"id":119984,"venueName":"Sant\u0027Agata",
									 	"date":{"year":2014,"month":5,"dayOfMonth":14,"hourOfDay":0,"minute":0,"second":12}},
									 {	"deltaCash":0,
									 	"type":"LOSE_VENUE",
									 	"venue":35444,
									 	"id":119984,"venueName":"Sant\u0027Agata",
									 	"date":{"year":2014,"month":5,"dayOfMonth":14,"hourOfDay":0,"minute":0,"second":12}},
									 {	"deltaCash":250000,
									 	"type":"ONLY_CASH",
									 	"venue":null,
									 	"id":119901,
									 	"venueName":"with no name",
									 	"date":{"year":2014,"month":5,"dayOfMonth":14,"hourOfDay":0,"minute":0,"second":12}},
									 {	"deltaCash":-250000,
									 	"type":"ONLY_CASH",
									 	"venue":null,
									 	"id":119901,
									 	"venueName":"with no name",
									 	"date":{"year":2014,"month":5,"dayOfMonth":14,"hourOfDay":0,"minute":0,"second":12}},
									 {	"deltaCash":-50000,
									 	"type":"WRONG_VALUE",
									 	"venue":35443,
									 	"id":119985,
									 	"venueName":"San Giuliano",
									 	"date":{"year":2014,"month":5,"dayOfMonth":14,"hourOfDay":0,"minute":0,"second":12}},
									 {	"deltaCash":-50000,
									 	"type":"PROVIDED_OFFENSIVE_VALUE",
									 	"venue":35443,
									 	"id":119985,
									 	"venueName":"San Giuliano",
									 	"date":{"year":2014,"month":5,"dayOfMonth":14,"hourOfDay":0,"minute":0,"second":12}},
									 {	"deltaCash":-50000,
									 	"type":"WRONG_OFFENSIVE_VALUE",
									 	"venue":35443,
									 	"id":119985,
									 	"venueName":"San Giuliano",
									 	"date":{"year":2014,"month":5,"dayOfMonth":14,"hourOfDay":0,"minute":0,"second":12}},
									 {	"deltaCash":0,
									 	"type":"JUDGE",
									 	"venue":35443,
									 	"id":119985,
									 	"venueName":"San Giuliano",
									 	"date":{"year":2014,"month":5,"dayOfMonth":14,"hourOfDay":0,"minute":0,"second":12}},
									 {	"deltaCash":-100000,
									 	"type":"JUDGE",
									 	"venue":35443,
									 	"id":119985,
									 	"venueName":"San Giuliano",
									 	"date":{"year":2014,"month":5,"dayOfMonth":14,"hourOfDay":0,"minute":0,"second":12}},
									 {	"deltaCash":100000,
									 	"type":"JUDGE",
									 	"venue":35443,
									 	"id":119985,
									 	"venueName":"San Giuliano",
									 	"date":{"year":2014,"month":5,"dayOfMonth":14,"hourOfDay":0,"minute":0,"second":12}},
									 {	"deltaCash":125000,
									 	"type":"TAKE_VENUE",
									 	"venue":35443,
									 	"id":119985,
									 	"venueName":"San Giuliano",
									 	"date":{"year":2014,"month":5,"dayOfMonth":14,"hourOfDay":0,"minute":0,"second":12}},
									 {	"deltaCash":2500,
									 	"type":"RENT",
									 	"venue":35443,
									 	"id":119985,
									 	"venueName":"San Giuliano",
									 	"date":{"year":2014,"month":5,"dayOfMonth":14,"hourOfDay":0,"minute":0,"second":12}}]*/

			console.log('REPLY: ' + reply);
			var notificationsJson = reply;
			console.log('NOTIFICATIONS JSON: ' + JSON.stringify(notificationsJson));
			if(typeof notificationsJson != 'undefined'){
				//Iterating over the notifications info turning onto local Notification objects
				for(var i = 0; i < notificationsJson.length; i++){
					console.log('notificationsJson['+i+'] ---> ' + notificationsJson[i]);
					//Create an object from the json representation
					var notification = Notification.parse(notificationsJson[i]);
					console.log('notification ---> ' + notification);
					//Add the object to the collection
					notificationsCollection.push(notification);
				}
			}
			console.log('Notifications: ', notificationsCollection);
			console.log('Function loadNotifications finish...');
			callback(null, notificationsCollection);
		}else{
			console.log("ERROR: Unable to connect to database server: %j", error);
			callback(error);
		}
	})
};

exports.applyNotifications = function(toApply, player, notificationsCollection){
	for (var i in notificationsCollection) {
		var notification = notificationsCollection[i];
		if(typeof notification != 'undefined' && notification.processed == 'false'){
			switch(notification.type){
				case 'JUDGE':
					if(notification.deltaCash != 0){
						if(toApply == 'true'){
							userController.increaseCash(player, notification.deltaCash);
						}
						if(notification.deltaCash < 0){
							console.log(notification.type.toString() + " player lost " +  ((-1)*notification.deltaCash) + " Euro");
						}else{
							console.log(notification.type.toString() + " player win " +  notification.deltaCash + " Euro");
						}
					}
					break;

				case 'PROVIDED_OFFENSIVE_VALUE':
					if(notification.deltaCash != 0){
						if(toApply == 'true'){	
							userController.increaseCash(player, notification.deltaCash);
						}
						if(notification.deltaCash < 0){
							console.log(notification.type.toString() + " player lost " +  ((-1)*notification.deltaCash) + " Euro");
						}else{
							console.log(notification.type.toString() + " player win " +  notification.deltaCash + " Euro");
						}
					}
					break;

				case 'WRONG_VALUE':
					if(notification.deltaCash != 0){
						if(toApply == 'true'){
							userController.increaseCash(player, notification.deltaCash);
						}
						if(notification.deltaCash < 0){
							console.log(notification.type.toString() + " player lost " +  ((-1)*notification.deltaCash) + " Euro");
						}
						else{
							console.log(notification.type.toString() + " player win " +  notification.deltaCash + " Euro");
						}
					}
					break;

				case 'WRONG_OFFENSIVE_VALUE':
					if(notification.deltaCash != 0){
						if(toApply == 'true'){
							userController.increaseCash(player, notification.deltaCash);
						}
						if(notification.deltaCash < 0){
							console.log(notification.type.toString() + " player lost " +  ((-1)*notification.deltaCash) + " Euro");
						}else{
							console.log(notification.type.toString() + " player win " +  notification.deltaCash + " Euro");
						}
					}
					break;

				case 'ONLY_CASH':
					if(notification.deltaCash != 0){
						if(toApply == 'true'){
							userController.increaseCash(player, notification.deltaCash);
						}
						if(notification.deltaCash < 0){
							console.log(notification.type.toString() + " player lost " +  ((-1)*notification.deltaCash) + " Euro");
						}else{
							console.log(notification.type.toString() + " player win " +  notification.deltaCash + " Euro");
						}
					}
					break;

				case 'TAKE_VENUE':
					if(notification.deltaCash != 0){
						if(toApply == 'true'){
							userController.increaseCash(player, notification.deltaCash);		
							var venue = notification.venue;
							venueController.venueTaken(venue);
						}	
						console.log(notification.type.toString() + " player earn " +  notification.deltaCash + " Euro but lost venue " + notification.venueName);
					}else{
						console.log(notification.type.toString() + " player lost venue " + notification.venueName);
					}
					break;

				case 'RENT':
					if(notification.deltaCash != 0){
						if(toApply == 'true'){
							userController.increaseCash(notifications.get(i).getDeltaCash());
						}
						console.log(notification.type.toString() + " player earn " +  notification.deltaCash + " Euro to rent of venue " + notification.venueName);
					}
					break;

				case 'DAILY_BONUS':
					if(notification.deltaCash != 0){
						if(toApply){
							UserManager.getSharedManager().increaseCash(notifications.get(i).getDeltaCash());
						}
						console.log(notification.type.toString() + " player earn " +  notification.deltaCash + " Euro from daily bonus");
					}
							
					if(notification.deltaCash != 0){
						var message = Utility.getMessageBuilder("success", 9, notification.deltaCash);
						//Show message
					}
					break;

				case 'LOSE_MORTGAGED_VENUE':
					console.log(notification.type.toString() + " player lost venue mortgaged " + notification.venueName);
					venueController.lostMortgagedVenue(player, notification.venue);
					break;

				case 'LOSE_VENUE':
					console.log(notification.type.toString() + " player lost venue " + notification.venueName);
					venueController.lostVenue(player, notification.venue);
					break;

				default:
					//do nothing
			}
		}
	}
};

exports.completeNotifications = function(notificationsCollection, callback){
	var completedNotifications = [];
	for (var i in notificationsCollection) {
		var notification = notificationsCollection[i];
		if(typeof notification != 'undefined'){
			notification.date = Utility.formatDate(notification.date);
			switch(notification.type){
				case 'ONLY_CASH':
					if(notification.deltaCash < 0){
						notification["icon"] = './images/notifications/notif_lost_money.png';
						notification["text"] = 'Your financial promoter made a wrong investement and you lost money. Think about buying venues next time!';
					}else{
						notification["icon"] = './images/notifications/notif_won_money.png';
						notification["text"] = 'You won a lottery!';
					}
					break;
				case 'WRONG_VALUE':
					if(notification.deltaCash <= 0){
						notification["icon"] = './images/notifications/notif_wrong_value.png';
						notification["text"] = 'You were not thinking! The information you inserted about the venue ' + notification.venueName + ' was considered wrong by the Urbanopoly community. Try to be more precise to avoid paying your duty again!';
					}else{
						notification["icon"] = './images/notifications/notif_right_value.png';
						notification["text"] = 'You are an expert! The information you inserted about the venue ' + notification.venueName + ' was considered correct by the Urbanopoly community. Keep up the good work to earn further extra money!';
					}
					break;
				case 'PROVIDED_OFFENSIVE_VALUE':
					if(notification.deltaCash < 0){
						notification["icon"] = './images/notifications/notif_offensive.png';
						notification["text"] = 'The Urbanopoly community rejects offensive, vulgar, obscene or unlawful information. You were discovered guilty for your contribution about the venue ' + notification.venue.name + '. DON\'T DO IT AGAIN!';
					}
					break;
				case 'WRONG_OFFENSIVE_VALUE':
					if(notification.deltaCash != 0){
						if(notification.deltaCash < 0){
							notification["icon"] = './images/notifications/notif_offensive.png';
							notification["text"] = 'Hey, you reported an abuse related to the venue ' + notification.venueName + ', but the information was genuine! This is an illegal trick to try penalizing other players. DON\'T DO IT AGAIN!';
						}
					}
					break;
				case 'JUDGE':
					if(notification.deltaCash < 0){
						notification["icon"] = './images/notifications/notif_lost_money.png';
						notification["text"] = 'Oh no! Your advertisement on the venue ' + notification.venueName + ' was negatively rated by the Owner: you lost some money! Be more effective next time, ok?';
					}else if(notification.deltaCash == 0){
						notification["icon"] = './images/notifications/notif_lost_money.png';
						notification["text"] = 'The Owner of the venue ' + notification.venueName + ' rated your advertisement like too simple, thus you haven’t earned any money! Try harder next time, ok?';
					}else{
						notification["icon"] = './images/notifications/notif_won_money.png';
						notification["text"] = 'Well done! Your advertisement on the venue ' + notification.venueName + ' was positively rated by the Owner: you earned extra money! Keep up the good work!';
					}
					break;
				case 'TAKE_VENUE':
					if(notification.deltaCash != 0){
						notification["icon"] = './images/notifications/notif_lost_venue.png';
						notification["text"] = 'Your Venue ' + notification.venueName + ' has been taken';
					}else{
						notification["icon"] = './images/notifications/notif_lost_venue.png';
						notification["text"] = 'You lost ' + notification.venueName;
					}
					break;
				case 'RENT':
					notification["icon"] = './images/notifications/notif_won_money.png';
					notification["text"] = 'Rent in venue ' + notification.venueName;
					break;
				case 'DAILY_BONUS':
					if (notification.deltaCash == 0){
						notification["icon"] = './images/notifications/notif_lost_money.png';
						notification["text"] = 'You have to buy some venues and play regularly to earn a daily bonus';
					}else{
						notification["icon"] = './images/notifications/notif_won_money.png';
						notification["text"] = 'Daily Bonus';
					}
					break;
				case 'LOSE_MORTGAGED_VENUE':
					notification["icon"] = './images/notifications/notif_lost_venue.png';
					notification["text"] = 'You lost the mortgaged venue ' + notification.venueName;
					break;
				case 'LOSE_VENUE':
					notification["icon"] = './images/notifications/notif_lost_venue.png';
					notification["text"] = 'You lost ' + notification.venueName;
					break;
				default:
					//do nothing
			}
			completedNotifications.push(notification);
		}
	}
	callback(null, completedNotifications);
};