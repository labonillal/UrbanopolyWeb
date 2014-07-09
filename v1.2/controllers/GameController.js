/* Loading Module Dependencies */
var gameConf = require("../core/game");
var request = require("request");
var visitController = require('./VisitController');
var venueController = require('./VenueController');
var Utility = require('./Utility');
var Visit = require('../models/visit');
var VisitBuy = require('../models/visitBuy');
var Player = require('../models/player');
var Category = require('../models/category');

// Local variables
var servicePlayArea = "GetPlayArea";
var serviceGetHighScores = "GetHighscores";
var venueCategories = [];
var playDay = 0;
var dayDuration = 0;

// GameController Initialization
var stringCategory;
var stringCategoryTokens = [];
Utility.loadContentFromFile('./core/categories.txt', function(err, stringCategories){
  if(err){
    console.log('ERROR: Unable to load categories file. ' + err);
  }
  if(stringCategories){
    for(var i in stringCategories){
      stringCategory = stringCategories[i];
      stringCategoryTokens = stringCategory.split(";");
      venueCategoryJson = { "id":stringCategoryTokens[0],
                  "name":stringCategoryTokens[1],
                  "parent": stringCategoryTokens[2],
                  "type": stringCategoryTokens[3] };
      var venueCategory = Category.parse(venueCategoryJson);
      venueCategories.push(venueCategory);
    }
  }
});

// Categories
exports.getAllCategories = function(req, res){
  return venueCategories;
};

exports.getParentCategories = function(){
  var parentCategories = [];
  for (var i in venueCategories){
    var category = venueCategories[i];
    if (typeof category.parent == 'undefined'){
      parentCategories.push(category);
    }
  }
  return parentCategories;
};

exports.getChildCategoryOf = function(parentCategoryName){
  var childCategories = [];
  for (var i in venueCategories){
    var childCategory = venueCategories[i];
    if(typeof childCategory != 'undefined'){
      if (typeof childCategory.parent != 'undefined' && childCategory.parent == parentCategoryName){
        childCategories.push(childCategory);
      }
    }
  }
  if (childCategories.length == 0){
    console.log('No subcategories of category ' + parentCategoryName);
  }
  return childCategories;
};

exports.getCategoryById = function(categoryId){
  for (var i in venueCategories){
    var category = venueCategories[i];
    if (category.id == categoryId){
      return category;
    }
  }
  return null;
};

exports.getCategoryByName = function(){
  for (var i in venueCategories){
    var category = venueCategories[i];
    if (category.name == categoryName){
      return category;
    }
  }
  return null;
};

// Retrieves the game area
exports.downloadArea = function(req, res, lat, lon){

	// Prepare a request object
	var str = "{0}/{1}?uid={2}&lat={3}&lon={4}&maxDist={5}";
	var requestUrl = str.format(Utility.getServerAddress(), servicePlayArea, req.user.id, lat, lon, gameConf.maxDistance);
	console.log("PLAYER: %j", req.user.id);
	console.log("REQUEST_URL: %j", requestUrl);

	// Request to retrieve game area info from url
  	request({
    	url: requestUrl,
    	method: "GET",
    	timeout: 10000,
    	json: true
  	}, function (error, response, body) {
    	if (!error && response.statusCode === 200) {
          console.log(body);
          return body;
      	}else{
        	console.log("ERROR: Unable to connect to database server: %j", error);
          return null;
      	}
  	})
};

// Method to perform the buy action
exports.buyFreeVenue = function(venue, player, venueCategory, venueName){
  //1) Comprobar si tiene suficiente dinero
  console.log('PLAYER: %j', player);
  console.log('VENUE: %j', venue);
  console.log('NEW CATEGORY: %j', venueCategory);
  console.log('NEW NAME: %j', venueName);

  // Not undefined validation
  if(typeof venue == 'undefined' && typeof player == 'undefined'){
    console.log('ERROR: Undefined');
    return null;
  }
  // Enough money validation
  if(player.cash < venue.value){
    console.log('ERROR: Player dont have enough cash to buy the venue');
    return null;
  }
  // Player cash new value
  player.cash -= parseInt(venue.value);
  venue.state = 'MINE';
  player.numVenues += 1;
  console.log('PLAYER CASH UPDATED: %j', player);
  
  //Update venue
  venueController.updateVenue(venue);
  console.log('VENUE: ', venue);
  
  // Set the values to create a visit
  var json = { "type" : "BUY",
    "player" : player.id,
    "venue" : venue.id,
    "venueName" : venueName,
    "venueCategory" :  venueCategory,
    "date" : Utility.getCurrentDate(),
    "deltaMoney" : -venue.value,
    "sent" : 0,
    "offensive":false }

  // Create a visit
  var visit = VisitBuy.parse(json);

  // Add it to the array of visits
  visitController.addOutVisit(visit);

  // Mark as visited
  visitController.sendVisits(function (err, result){
    if(result){
      venueController.addVisitedVenue(venue);
      console.log('ADDED VISIT: %j', visit);
      return visit;
    }else{
      visitController.deleteVisit(visit);
      console.log('DELETED VISIT: %j', visit);
      return null;
    }
    //5) Share on facebook    
  });
};

// Method to sell a venue
exports.sellVenue = function(venue, player){
  //1) Verificar si ya ha sido visitada VenuesManager.venueHasBeenVisited(venue)
  //2) Vender mediante VenuesManager.sellVenue(
  console.log('PLAYER: %j', player);
  console.log('VENUE: %j', venue);

  // Not undefined validation
  if(typeof venue == 'undefined' && typeof player == 'undefined'){
    console.log('ERROR: Undefined');
    return null;
  }
  // Owner have been changed validation
  if(venue.state == 'FREE' || venue.state == 'OCCUPIED'){
    console.log('ERROR: Venue owner have been changed');
    return null;
  }
  
  var mortgageValue = parseInt(venue.value * gameConf.mortgagePercentage/100);
  var visit;
  
  if(venue.state == 'MINE_MORTGAGED'){
    // Set the new cash value of the player
    player.cash += mortgageValue;
    console.log('PLAYER CASH UPDATED: %j', player);
    player.numVenues -= 1;
    // Set the values to create a visit
    var json = { "type" : "SELL",
      "player" : player.id,
      "venue" : venue.id,
      "date" : Utility.getCurrentDate(),
      "deltaMoney" : mortgageValue,
      "sent" : 0,
      "offensive":false }
    // Create a visit 
    visit = Visit.parse(json);
    venue.state = 'FREE';
    //Update venue
    venueController.updateVenue(venue);
    console.log('VENUE: ', venue);
  }else{
    // Set the new cash value of the player
    player.cash += venue.value;
    player.numVenues -= 1;
    console.log('PLAYER CASH UPDATED: %j', player);
    // Set the values to create a visit
    var json = { "type" : "SELL",
      "player" : player.id,
      "venue" : venue.id,
      "date" : Utility.getCurrentDate(),
      "deltaMoney" : venue.value,
      "sent" : 0,
      "offensive":false }
    // Create a visit 
    visit = Visit.parse(json);
    venue.state = 'FREE';
    //Update venue
    venueController.updateVenue(venue);
    console.log('VENUE: ', venue);
  }
  
  // Add it to the array of visits
  visitController.addOutVisit(visit);

  // Mark as visited
  visitController.sendVisits(function (err, result){
    if(result){
      venueController.addVisitedVenue(venue);
      console.log('ADDED VISIT: %j', visit);
      return visit;
    }else{
      visitController.deleteVisit(visit);
      console.log('DELETED VISIT: %j', visit);
      return null;
    }
  });
};

// Method to mortgage venue
exports.mortgageVenue = function(venue, player){
  //1) Verificar si ya ha sido visitada VenuesManager.venueHasBeenVisited(venue)
  //2) Crear hipoteca mediante VenuesManager.mortgageVenue(
  console.log('PLAYER: %j', player);
  console.log('VENUE: %j', venue);

  // Not undefined validation
  if(typeof venue == 'undefined' && typeof player == 'undefined'){
    console.log('ERROR: Undefined');
    return null;
  }
  // Owner have been changed validation
  if(venue.state == 'FREE' || venue.state == 'OCCUPIED'){
    console.log('ERROR: Venue owner have been changed');
    return null;
  }
  // Already mortgage venue
  if(venue.state == 'MINE_MORTGAGED'){
    console.log('ERROR: Venue is already mortgage');
    return null;
  }
  
  var mortgageValue = parseInt(venue.value * gameConf.mortgagePercentage/100);

  // Set the new cash value of the player
  player.cash += mortgageValue;
  console.log('PLAYER CASH UPDATED: %j', player);
  venue.state = 'MINE_MORTGAGED';
  var today = new Date();
  var tomorrow = new Date();
  tomorrow.setDate(today.getDate() + 1);
  venue.deadTime.year = tomorrow.getFullYear();
  venue.deadTime.month = tomorrow.getMonth();
  venue.deadTime.dayOfMonth = tomorrow.getDate();
  venue.deadTime.hourOfDay = tomorrow.getHours();
  venue.deadTime.minute = tomorrow.getMinutes();
  venue.deadTime.second = tomorrow.getSeconds();
  
  //Update venue
  venueController.updateVenue(venue);
  console.log('VENUE: ', venue);
  
  // Set the values to create a visit
  var json = { "type" : "MORTGAGE",
    "player" : player.id,
    "venue" : venue.id,
    "date" : Utility.getCurrentDate(),
    "deltaMoney" : mortgageValue,
    "sent" : 0,
    "offensive":false }
  // Create a visit 
  visit = Visit.parse(json);
  
  // Add it to the array of visits
  visitController.addOutVisit(visit);

  // Mark as visited
  visitController.sendVisits(function (err, result){
    if(result){
      venueController.addVisitedVenue(venue);
      console.log('ADDED VISIT: %j', visit);
      return visit;
    }else{
      visitController.deleteVisit(visit);
      console.log('DELETED VISIT: %j', visit);
      return null;
    }
  });
};

// Method to redeem mortgaged venue
exports.redeemMortgagedVenue = function(venue, player){
  //1) VenuesManager.redeemMortgagedVenue(
  console.log('PLAYER: %j', player);
  console.log('VENUE: %j', venue);

  // Not undefined validation
  if(typeof venue == 'undefined' && typeof player == 'undefined'){
    console.log('ERROR: Undefined');
    return null;
  }
  // Owner have been changed validation
  if(venue.state == 'FREE' || venue.state == 'OCCUPIED'){
    console.log('ERROR: Venue owner have been changed');
    return null;
  }
  // Already redeemed venue
  if(venue.state == 'MINE'){
    console.log('ERROR: Venue mortgage is already redeemed');
    return null;
  }
  
  var mortgageValue = parseInt(venue.value * gameConf.mortgagePercentage/100);
  
  // Enough money validation
  if(player.cash < mortgageValue){
    console.log('ERROR: Player dont have enough cash to mortgage the venue');
    return null;
  }
  // Set the new cash value of the player
  player.cash -= mortgageValue;
  console.log('PLAYER CASH UPDATED: %j', player);
  venue.state = 'MINE';
  //Update venue
  venueController.updateVenue(venue);
  console.log('VENUE: ', venue);
  
  // Set the values to create a visit
  var json = { "type" : "REDEEM",
    "player" : player.id,
    "venue" : venue.id,
    "date" : Utility.getCurrentDate(),
    "deltaMoney" : -mortgageValue,
    "sent" : 0,
    "offensive":false }
  // Create a visit 
  visit = Visit.parse(json);
  
  // Add it to the array of visits
  visitController.addOutVisit(visit);

  // Mark as visited
  visitController.sendVisits(function (err, result){
    if(result){
      venueController.addVisitedVenue(venue);
      console.log('ADDED VISIT: %j', visit);
      return visit;
    }else{
      visitController.deleteVisit(visit);
      console.log('DELETED VISIT: %j', visit);
      return null;
    }
  });
};

// Method to perform the PAY option on the GameWheel
exports.payFee = function(venue, player){
	console.log('PLAYER: %j', player);
	console.log('VENUE: %j', venue);
  // Not undefined validation
  if(typeof venue == 'undefined' && typeof player == 'undefined'){
    console.log('ERROR: Undefined');
    return null;
  }
  // Enough money validation
  if(player.cash < venue.value*gameConf.feePercentage/100){
    console.log('ERROR: Player dont have enough cash to buy the venue');
    return null;
  }
  // Venue is not free validation
  if(venue.state == 'FREE'){
    console.log('ERROR: Venue is free');
    return null;
  }
  // Owner have been changed validation
  if(venue.state == 'MINE' || venue.state == 'MINE_MORTGAGED'){
    console.log('ERROR: Venue owner have been changed');
    return null;
  }
  // Set the new cash value of the player
  player.cash -= parseInt(venue.value*gameConf.feePercentage/100);
  console.log('PLAYER CASH UPDATED: %j', player);
  
  // Set the values to create a visit
  var json = { "type" : "PAY",
    "player" : player.id,
    "venue" : venue.id,
    "date" : Utility.getCurrentDate(),
    "deltaMoney" : (-1)*parseInt(venue.value*gameConf.feePercentage/100),
    "sent" : 0,
    "offensive":false }

  // Create a visit
  var visit = Visit.parse(json);

  // Add it to the array of visits
  visitController.addOutVisit(visit);

  // Mark as visited
  visitController.sendVisits(function (err, result){
    if(result){
      venueController.addVisitedVenue(venue);
      console.log('ADDED VISIT: %j', visit);
      return visit;
    }else{
      visitController.deleteVisit(visit);
      console.log('DELETED VISIT: %j', visit);
      return null;
    }
  });
};

// Method to perform the TAKE option on the GameWheel
exports.takeVenue = function(venue, player, venueName, venueCategory){
  console.log('PLAYER: %j', player);
  console.log('VENUE: %j', venue);
  console.log('VENUE NAME: %j', venueName);
  console.log('VENUE CATEGORY: %j', venueCategory);
  // Get the player
  //var player = Player.parse(req.user);
  // Take cost
  var takeCost = venue.value * gameConf.takePercentage/100;
  // Not undefined validation
  if(typeof venue == 'undefined' && typeof player == 'undefined'){
    console.log('ERROR: Undefined');
    return null;
  }
  // Enough money validation
  if(player.cash < takeCost){
    console.log('ERROR: Player dont have enough cash to buy the venue');
    return null;
  }
  // Venue is not free validation
  if(venue.state == 'FREE'){
    console.log('ERROR: Venue is free');
    return null;
  }
  // Owner have been changed validation
  if(venue.state == 'MINE' || venue.state == 'MINE_MORTGAGED'){
    console.log('ERROR: Venue owner have been changed');
    return null;
  }
  //Player takes the venue
  player.cash -= takeCost;
  player.numVenues += 1;
  console.log('PLAYER CASH UPDATED: %j', player);
  venue.state = 'MINE';
  //Update venue
  venueController.updateVenue(venue);
  // Set the values to create a visit
  var json = { "type" : "TAKE",
    "player" : player.id,
    "venue" : venue.id,
    "venueName" : venueName,
    "venueCategory" :  venueCategory,
    "date" : Utility.getCurrentDate(),
    "deltaMoney" : -takeCost,
    "sent" : 0,
    "offensive":false }

  // Create a visit
  var visit = VisitBuy.parse(json);

  // Add it to the array of visits
  visitController.addOutVisit(visit);

  // Mark as visited
  visitController.sendVisits(function (err, result){
    if(result){
      venueController.addVisitedVenue(venue);
      console.log('ADDED VISIT: %j', visit);
      return visit;
    }else{
      visitController.deleteVisit(visit);
      console.log('DELETED VISIT: %j', visit);
      return null;
    }
  });
};

// Method to perform the QUIZ option on the GameWheel
exports.quiz = function(venue, player, selected, skips){
  console.log('PLAYER: %j', player);
  console.log('VENUE: %j', venue);
  console.log('SELECTED: %j', selected);
  console.log('SKIPS: %j', skips);
  // Not undefined validation
  if(venue == undefined && player == undefined){
    console.log('ERROR: Undefined');
    return null;
  }
  // Venue is not free validation
  if(venue.state == 'FREE'){
    console.log('ERROR: Venue is free');
    return null;
  }
  // Owner have been changed validation
  if(venue.state == 'MINE' || venue.state == 'MINE_MORTGAGED'){
    console.log('ERROR: Venue owner have been changed');
    return null;
  }

  // Calculate the money earned on the quiz
  var money = 0;

  for(var skip in skips){
    if(skip == false){
      money += parseInt(gameConf.moneyForQuizQuestion);
    }
	console.log('MONEY EARNED: %j', money);
  }

  // Set player cash
  player.cash += money;
  console.log('PLAYER CASH UPDATED: %j', player);
  // Get visits of quiz type
  var visit = visitController.getVisitQuiz(venue);
  console.log('VISIT: %j', visit);

  if(typeof visit != 'undefined'){
    visit.selected = selected;
    visit.skips = skips;
    visit.date = Utility.getCurrentDate();
    visit.deltaMoney = money;

    // Add it to the array of visits
    visitController.addOutVisit(visit);

    // Mark as visited
    visitController.sendVisits(function (err, result){
      if(result){
        venueController.addVisitedVenue(venue);
        console.log('ADDED VISIT: %j', visit);
        return visit;
      }else{
        visitController.deleteVisit(visit);
        console.log('DELETED VISIT: %j', visit);
        return null;
      }
    });
  }
  return null;
};

// Method to perform the ADVERTISE option on the GameWheel
exports.advertise = function(venue, player, category, venueName, featureValues, skips, deltaCash){
  console.log('PLAYER: %j', player);
  console.log('VENUE: %j', venue);
  console.log('CATEGORY: %j', category);
  console.log('VENUE NAME: %j', venueName);
  console.log('FEATURE VALUES: %j', featureValues);
  console.log('SKIPS: %j', skips);
  console.log('DELTA CASH: %j', deltaCash);
  // Not undefined validation
  if(typeof venue == 'undefined' && typeof player == 'undefined'){
    console.log('ERROR: Undefined');
    return null;
  }
  // Venue is not free validation
  if(venue.state == 'FREE'){
    console.log('ERROR: Venue is free');
    return null;
  }
  // Owner have been changed validation
  if(venue.state == 'MINE' || venue.state == 'MINE_MORTGAGED'){
    console.log('ERROR: Venue owner have been changed');
    return null;
  }
  // Get visits of advertise type
  var visit = visitController.getVisitAdvertise;

  // Set player cash
  player.cash += deltaCash;
  console.log('PLAYER CASH UPDATED: %j', player);

  if(typeof visit != 'undefined'){
    visit.date = Utility.getCurrentDate();
    visit.deltaMoney = deltaCash;
    visit.skips = skips;
    visit.venueCategory = category;
    visit.venueName = venueName;
    visit.featureValues = featureValues;

    // Add it to the array of visits
    visitController.addOutVisit(visit);

    // Mark as visited
    visitController.sendVisits(function (err, result){
      if(result){
        venueController.addVisitedVenue(venue);
        console.log('ADDED VISIT: %j', visit);
        return visit;
      }else{
        visitController.deleteVisit(visit);
        console.log('DELETED VISIT: %j', visit);
        return null;
      }
    });
  }
  return null;
};

// Method to perform the SKIP option on the GameWheel
exports.skip = function(venue, player){
  console.log('PLAYER: %j', player);
  console.log('VENUE: %j', venue);
  // Get the player
  //var player = Player.parse(req.user);
  // Not undefined validation
  if(typeof venue == 'undefined' && typeof player == 'undefined'){
	console.log('ERROR: Undefined');
    return null;
  }
  // Venue is not free validation
  if(venue.state == 'FREE'){
    console.log('ERROR: Venue is free');
    return null;
  }
  // Owner have been changed validation
  if(venue.state == 'MINE' || venue.state == 'MINE_MORTGAGED'){
    console.log('ERROR: Venue owner have been changed');
    return null;
  }

  // Set player cash
  player.cash += parseInt(gameConf.moneyForSkip);
  console.log('PLAYER CASH UPDATED: %j', player);

  // Set the values to create a visit
  var json = { "type" : "SKIP",
    "player" : player.id,
    "venue" : venue.id,
    "date" : Utility.getCurrentDate(),
    "deltaMoney" : parseInt(gameConf.moneyForSkip),
    "sent" : 0,
    "offensive":false }

  // Create a visit
  var visit = Visit.parse(json);

  // Add it to the array of visits
  visitController.addOutVisit(visit);

  // Mark as visited
  visitController.sendVisits(function (err, result){
    if(result){
      venueController.addVisitedVenue(venue);
      console.log('ADDED VISIT: %j', visit);
      return visit;
    }else{
      visitController.deleteVisit(visit);
      console.log('DELETED VISIT: %j', visit);
      return null;
    }
  });
};

// Method to get the fee to pay for a venue
exports.getFeeToPay = function(venue){
  var feeToPay = { "rent" : parseInt(venue.value * gameConf.feePercentage/100) };
  console.log('FEE TO PAY: ', feeToPay);
  return feeToPay;
};

// Method to get the cost of take a venue
exports.getTakeCost = function(venue){
  var takeCost = { "cost" : parseInt(venue.value * gameConf.takePercentage/100)};
  console.log('TAKE COST: ', takeCost);
  return takeCost;
};

// Method to get the high scores
exports.getHighscores = function(playerId, fromPosition, toPosition, callback){
  console.log('Function getHighscores start...');
  var highscores = [];
  var str = "{0}/{1}?uid={2}&lowerthreshold={3}&upperthreshold={4}";
  var requestUrl = str.format(Utility.getServerAddress(), serviceGetHighScores, playerId,parseInt(fromPosition),parseInt(toPosition));

  console.log("PLAYER: %j", playerId);
  console.log("REQUEST_URL: %j", requestUrl);

  // Request to retrieve the venues of the player
  request({
    url: requestUrl,
    method: "GET",
    timeout: 10000
  }, function (error, response, data) {
    if (!error && response.statusCode === 200) {
      console.log('DATA: ', data);
      //Parse server response object
      var reply = JSON.parse(data);
      console.log('REPLY: ', reply);

      console.log('Function getHighscores finish...');
      callback(null, reply);
    }else{
      console.log("ERROR: Unable to connect to database server: %j", error);
      callback(error);
    }
  }) 
};