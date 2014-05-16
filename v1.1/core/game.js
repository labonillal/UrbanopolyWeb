// config/game.js
module.exports = {
	// Servers
	'localhostServerUrl' : 'http://192.168.1.11:8080/urbanopoly-server', // Local emulator
	'cefrielServerUrl' : 'http://swa.cefriel.it/urbangames/urbanopoly-server',	// Cefriel server

	// Game parameters
	'mediumVenueThreshold' : '129500',	//Threshold for a venue to become medium venue
	'expensiveVenueThreshold' : '280000',	//Threshold for a venue to become expensive venue
	'maxDistance' : '0.3' // Max distance to return venues
};