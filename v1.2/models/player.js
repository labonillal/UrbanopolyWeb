/**
* Parse Player
*/
exports.parse = function(json) {
	console.log('Executing Player Model...');
	console.log('Player Model JSON: '+JSON.stringify(json));
	if ('string' == typeof json){
		json = JSON.parse(json);
		console.log('Player Model IF Executed');
	}
  
	var player = {};
	player.id = json.id;
	player.name = json.name;
	player.picture = json.picture;
	player.cash = json.cash;
	player.numVenues = json.numVenues;
	player.totalVenuesValue = json.totalVenuesValue;
	
	return player;
}