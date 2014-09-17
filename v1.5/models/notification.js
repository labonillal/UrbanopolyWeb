//
// UrbanopolyWeb v1.5.0
// 
// Copyright (c) 2012-2014, CEFRIEL
// Licensed under the Apache 2.0 License.
//

// Parse Notification
exports.parse = function(json) {
	if ('string' == typeof json){
		json = JSON.parse(json);
		console.log('Notification Model IF Executed');
	}
	var notification = {};
	notification.id = json.id;
	notification.player = json.player;
	notification.type = json.type;
	notification.venue = json.venue;
	notification.deltaCash = json.deltaCash;
	notification.processed = json.processed;
	notification.venueName = json.venueName;
	notification.date = json.date;

	return notification;
};