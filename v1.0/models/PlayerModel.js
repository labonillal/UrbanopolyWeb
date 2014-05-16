/* Class to represent a player */
function Player () {
    this.id;				//player id
    this.name;				//player name
    this.cash;				//player cash amount
    this.numVenues;			//player venues number
    this.totalVenuesValue;	//player venues total value
};

// Method to get player id
Player.prototype.getId = function() {
    return this.id;
};
// Method to set the player id
Player.prototype.setId = function(id) {
    this.id = id;
};
// Method to get player name
Player.prototype.getName = function(){
	return this.name;
};
// Method to set the player name
Player.prototype.setName = function(name){
	this.name = name;
};
// Method to get player cash
Player.prototype.getCash = function(){
	return this.cash;
};
// Method to set the player cash
Player.prototype.setCash = function(cash){
	this.cash = cash;
};
// Method to get player numVenues
Player.prototype.getNumVenues = function(){
	return this.numVenues;
};
// Method to set the player numVenues
Player.prototype.setNumVenues = function(numVenues){
	this.numVenues = numVenues;
};
// Method to get player totalVenuesValue
Player.prototype.getTotalVenuesValue = function(){
	return this.getTotalVenuesValue;
};
// Method to set the player getTotalVenuesValue
Player.prototype.setTotalVenuesValue = function(totalVenuesValue){
	this.totalVenuesValue = totalVenuesValue;
};