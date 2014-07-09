// config/game.js
module.exports = {
	// Servers
	'localhostServerUrl' : 'http://192.168.1.6:8080/urbanopoly-server', // Local emulator
	'cefrielServerUrl' : 'http://swa.cefriel.it/urbangames/urbanopoly-server',	// Cefriel server

	// Game parameters
	'mediumVenueThreshold' : '129500',	//Threshold for a venue to become medium venue
	'expensiveVenueThreshold' : '280000',	//Threshold for a venue to become expensive venue
	'maxDistance' : '0.3',	// Max distance to return venues
	'mortgagePercentage' : '50',	// Mortgage percentage
	'feePercentage' : '1',	// Fee percentage
	'takePercentage' : '150',	// Take percentage
	'moneyForSkip' : '2000',	// Money earned for skip
	'moneyForQuizQuestion' : '2000' // Money earned by each quiz question
};