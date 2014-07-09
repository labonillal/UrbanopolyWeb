var myMarkersLayer;
var myPositionLayer;
var map;
var lat;
var lon;
var selectedVenue;
var visitJudge;

// Function to load the map
$(document).ready(function(){
	// MapBox Map
	map = L.mapbox.map('map', 'lbonillal.i2gblid1').setView([45, 9], 9);

	myMarkersLayer = L.mapbox.featureLayer().addTo(map);

	map.locate();
			
	map.on('locationfound', function(e){
		lat = e.latlng.lat;
		lon = e.latlng.lng;
		//Create the map on the location position
		createMap(lat, lon);
		map.fitBounds(e.bounds);
	});

	// If the user chooses not to allow their location
	// to be shared, display an error message.
	map.on('locationerror', function() {
		$("#defaultLocationModal").modal('show');
		console.log('Position could not be found!');
	});
});

// Function to animate the dropdowns like a selection item
$(document.body).on( 'click', '.dropdown-menu li', function( event ) {
	var $target = $( event.currentTarget );
	$target.closest( '.btn-group' )
		.find( '[data-bind="label"]' ).text( $target.text() )
		.end()
		.children( '.dropdown-toggle' ).dropdown( 'toggle' );

	return false;
});

function createMap(lat, lon) {
	console.log('Location Coordinates: ' + lon +' , ' + lat);

		//request map data to the server
		requestUpdatedMap(lat, lon);
		
		var geoJson = [{
				"type": "Feature",
				"geometry": {
					"type": "Point",
					"coordinates": [lon, lat]
				},
				"properties": {
					"title": "Me",
					"icon": {
						"iconUrl": "./images/gps_position.png",
						"iconSize": [50, 50],
						"iconAnchor": [25, 25],
						"popupAnchor": [0, -25],
						"className": "dot"
					}
				}
			}
		];
		
		// Set a custom icon on each marker based on feature properties for myMarkersLayer
		myMarkersLayer.on('layeradd', function(e) {
			var marker = e.layer,
			feature = marker.feature;

			marker.setIcon(L.icon(feature.properties.icon));
		});

		// Marker event handler
		myMarkersLayer.on('click',function(e) {
    		console.log(e.layer.feature.properties);
    		console.log('JSON: ', JSON.stringify(e.layer.feature.properties));
    		selectedVenue = JSON.stringify(e.layer.feature.properties);
    		// Request to get the category of the venue
    		$.ajax(
				{
			        type: 'GET',
			        url: '/retrieveCategory?category=' + e.layer.feature.properties["category"],
			        success: function (result) {
			        	if(result.length != 0){
			            	var category = result;
							$("#freeVenueCategory").text(category.name + " (" + category.parent + ")");
							$("#occupiedVenueCategory").text(category.name + " (" + category.parent + ")");
						}else{
							$("#freeVenueCategory").text("Unknown Category");
							$("#occupiedVenueCategory").text("Unknown Category");
						}
			       	},
			        error: function (req, status, error) {
						console.log('ERROR: ' + error);
						console.log('Unable to get retrieveChildCategories response');
			        }
			    });

    		//Default setup
    		$("#buyBtn").attr("disabled", "disabled");
			$("#mtgBtn").attr("disabled", "disabled");
			$("#rdmBtn").attr("disabled", "disabled");
			$("#selBtn").attr("disabled", "disabled");
			$("#okMsgModal").hide();
			$("#yesMsgModal").hide();
			$("#noMsgModal").hide();

			//Free Venue
    		if(e.layer.feature.properties["state"] == 'FREE'){
    			$("#freeModalHeader").attr("src",'/images/title_free_venue.png');
    			// Request to get rent info
    			$.ajax(
					{
			            type: 'GET',
			            url: '/retrieveVenueRent?venueValue=' + e.layer.feature.properties["value"],
			            success: function (result) {
			            	console.log('RENT: ', result);
			            	if(result.length != 0){
								$("#freeVenueRent").text(result.rent);
							}else{
								$("#freeVenueRent").text("Unknown Rent");
							}
			            },
			            error: function (req, status, error) {
							console.log('ERROR: ' + error);
							console.log('Unable to get retrieveVenueRent response');
			            }
			        });
    			// Enable buy button
    			$("#buyBtn").removeAttr("disabled");
    			// Set venue name on input field
    			if(e.layer.feature.properties["name"] != null){
    				$("#inputVenueName").val(e.layer.feature.properties.name);
    				$("#freeVenueName").text(e.layer.feature.properties.name);
    			}else{
    				$("#inputVenueName").val("Unnamed Venue");
    				$("#freeVenueName").text("Unnamed Venue");
    			}
    			$("#freeVenueIcon").attr("src",e.layer.feature.properties.icon.iconUrl);
    			$("#freeVenueCategory").text(e.layer.feature.properties.category);
    			$("#freeVenueValue").text(e.layer.feature.properties.value);
    			// Show modal
    			$("#freeModal").modal('show');
    		}
    		//Occupied Venue
    		else if(e.layer.feature.properties["state"] == 'OCCUPIED'){
    			if(e.layer.feature.properties["name"] != null){
    				$("#occupiedVenueName").text(e.layer.feature.properties.name);
    			}else{
    				$("#occupiedVenueName").text("Unnamed Venue");
    			}
    			$("#occupiedVenueIcon").attr("src",e.layer.feature.properties.icon.iconUrl);
    			$("#occupiedVenueValue").text(e.layer.feature.properties.value);
    			// Show modal
    			$("#occupiedModal").modal('show');
    		}
    		//My Venue
    		else{
    			$("#freeModalHeader").attr("src",'/images/title_my_venue.png');
    			// Request to get rent info
    			$.ajax(
					{
			            type: 'GET',
			            url: '/retrieveVenueRent?venueValue=' + e.layer.feature.properties["value"],
			            success: function (result) {
			            	console.log('RENT: ', result);
			            	if(result.length != 0){
								$("#freeVenueRent").text(result.rent);
							}else{
								$("#freeVenueRent").text("Unknown Rent");
							}
			            },
			            error: function (req, status, error) {
							console.log('ERROR: ' + error);
							console.log('Unable to get retrieveVenueRent response');
			            }
			        });
    			if(e.layer.feature.properties["name"] != null){
    				$("#freeVenueName").text(e.layer.feature.properties.name);
    			}else{
    				$("#freeVenueName").text("Unnamed Venue");
    			}
    			$("#freeVenueIcon").attr("src",e.layer.feature.properties.icon.iconUrl);
    			$("#freeVenueCategory").text(e.layer.feature.properties.category);
    			$("#freeVenueValue").text(e.layer.feature.properties.value);
    			// Enable sell button
    			$("#selBtn").removeAttr("disabled");
    			if (e.layer.feature.properties["state"] == 'MINE'){
    				// Enable mortgage button
    				$("#mtgBtn").removeAttr("disabled");
    			}
    			else if (e.layer.feature.properties["state"] == 'MINE_MORTGAGED'){
    				// Enable redeem button
    				$("#rdmBtn").removeAttr("disabled");
    			}
    			if(visitJudge != null){

    			}

    			// Show modal
    			$("#freeModal").modal('show');	
    		}
		});
		
		// My position on the map
		myPositionLayer = L.mapbox.featureLayer().addTo(map);
		
		// Set a custom icon on each marker based on feature properties for myPositionLayer
		myPositionLayer.on('layeradd', function(e) {
			var marker = e.layer,
			feature = marker.feature;

			marker.setIcon(L.icon(feature.properties.icon));
		});
		
		myPositionLayer.setGeoJSON(geoJson);
};

function requestUpdatedMap(lat, lon) {
	var temp = '/RetrieveMap?lat=' + lat + '&lon=' + lon;
	console.log('REQUEST URL: ',temp);
    $.ajax(
		{
            type: 'GET',
            url: '/RetrieveMap?lat=' + lat + '&lon=' + lon,
            success: function (result) {
            	if(result != ""){
            		myMarkersLayer.setGeoJSON(result);
					map.fitBounds(myMarkersLayer.getBounds());
            	}else{
            		console.log('No data available for this location');
            		map.fitBounds(myPositionLayer.getBounds());
            	}
            },
            error: function (req, status, error) {
				console.log('ERROR: ' + error);
				console.log('Unable to get map data');
            }
        });
};

// Default Location Controls
$("#location1").click(function() {
	lat = 45.480265;
	lon = 9.223666;
	createMap(45.480265, 9.223666);
	$("#defaultLocationModal").modal('hide');
});

$("#location2").click(function() {
	lat = 42.313373;
	lon = -71.057157;
	createMap(42.313373, -71.057157);
	$("#defaultLocationModal").modal('hide');
});

$("#location3").click(function() {
	lat = 52.3747158;
	lon = 4.8986166;
	createMap(52.3747158, 4.8986166);
	$("#defaultLocationModal").modal('hide');
});

$("#location4").click(function() {
	lat = 45.8124104;
	lon = 9.0928468;
	createMap(45.8124104, 9.0928468);
	$("#defaultLocationModal").modal('hide');
});

// FREE CONTROLS
//Buy button event
$("#buyBtn").click(function() {
	$("#freeModal").modal('hide');
	$("#buyModal").modal('show');
	$('#parentPanel').hide();
	$('#childPanel').hide();
	$('#buyButton').prop('disabled', true);
});

//Buy insert name ok event
$("#insertNameOk").click(function() {
	$('#parentPanel').show();
});

//Parent category selection event
$("#parentSelect").change(function() {
	console.log($("#parentSelect").val());
	// Clean childSelect
	$("#childSelect").empty();
	// Request to retrieveChildCategories
	var url = '/retrieveChildCategories';
	console.log('REQUEST URL: ', url);
    $.ajax(
		{
            type: 'GET',
            url: '/retrieveChildCategories?category=' + $("#parentSelect option:selected").text(),
            success: function (result) {
            	if(result.length != 0){
					for(var i in result){
						$("#childSelect").append("<option value=" + result[i].id + ">" + result[i].name + "</option>");
					}
				}else{
					$('#childPanel').hide();
				}

            },
            error: function (req, status, error) {
				console.log('ERROR: ' + error);
				console.log('Unable to get retrieveChildCategories response');
            }
        });
	$('#childPanel').show();
});

$("#childSelect").change(function() {
	$('#buyButton').prop('disabled', false);
});

//Buy submit event handle
$("#buyButton").click(function() {
	console.log('BUY CLICKED');
	var inputVenueName = $("#inputVenueName").val();
	var parentCategory = $("#parentSelect").val();
	var childCategory = $("#childSelect").val();
	console.log('VENUE: ' + selectedVenue);
	console.log('VENUE NAME: ' + inputVenueName);
	console.log('VENUE PARENT CATEGORY: ' + parentCategory + ' NAME: ' + $("#parentSelect option:selected").text());
	console.log('VENUE CHILD CATEGORY: ' + childCategory  + ' NAME: ' + $("#childSelect option:selected").text());
	// Request to BuyAction
	var url = '/BuyAction';
	var jsonData = {"venueCategory":childCategory,"venueName":inputVenueName,"venue":selectedVenue };
	console.log(jsonData);
	console.log('REQUEST URL: ', url);
    $.ajax(
		{
            type: 'POST',
            url: '/BuyAction',
            data: jsonData,
            success: function (result) {
				console.log('BuyAction REQUEST RESULT: ', JSON.stringify(result));
				//Success message
				$("#scsMsgContent").text(result.message.text);
				$("#yesMsgModal").show();
				$("#yesMsgModal").attr("disabled", "disabled");
				$("#noMsgModal").show();
				$("#errorMessage").hide();
				//Reload player data on footer
				$("#userCash").text(result.player.cash);
				$("#userNumVenues").text(result.player.numVenues);
            },
            error: function (req, status, error) {
				console.log('ERROR: ' + error);
				console.log('Unable to get BuyAction response');
            }
        });
    // Close modal and show message
	$("#buyModal").modal('hide');
	$("#messageModal").modal('show');
});

//Mortgage button event
$("#mtgBtn").click(function() {
	console.log('MORTGAGE CLICKED');
	console.log('VENUE: ' + selectedVenue);
	// Request to MortgageAction
	var url = '/MortgageAction';
	var jsonData = { "venue":selectedVenue };
	console.log(jsonData);
	console.log('REQUEST URL:' , url);
    $.ajax(
		{
            type: 'POST',
            url: '/MortgageAction',
            data: jsonData,
            success: function (result) {
				console.log('MortgageAction REQUEST RESULT: ', JSON.stringify(result));
				//Success message
				$("#scsMsgContent").text(result.message.text);
				$("#okMsgModal").show();
				$("#errorMessage").hide();
				//Reload player data on footer
				$("#userCash").text(result.player.cash);
				$("#userNumVenues").text(result.player.numVenues);
            },
            error: function (req, status, error) {
				console.log('ERROR: ' + error);
				console.log('Unable to get MortgageAction response');
            }
        });
    // Close modal and show message
	$("#freeModal").modal('hide');
	$("#messageModal").modal('show');
});

//Redeem button event
$("#rdmBtn").click(function() {
	console.log('REDEEM CLICKED');
	console.log('VENUE: ' + selectedVenue);
	// Request to RedeemAction
	var url = '/RedeemAction';
	var jsonData = { "venue":selectedVenue };
	console.log(jsonData);
	console.log('REQUEST URL: ', url);
    $.ajax(
		{
            type: 'POST',
            url: '/RedeemAction',
            data: jsonData,
            success: function (result) {
				console.log('RedeemAction REQUEST RESULT: ', JSON.stringify(result));
				//Success message
				$("#scsMsgContent").text(result.message.text);
				$("#okMsgModal").show();
				$("#errorMessage").hide();
				//Reload player data on footer
				$("#userCash").text(result.player.cash);
				$("#userNumVenues").text(result.player.numVenues);
            },
            error: function (req, status, error) {
				console.log('ERROR: ' + error);
				console.log('Unable to get RedeemAction response');
            }
        });
    // Close modal and show message
	$("#freeModal").modal('hide');
	$("#messageModal").modal('show');
});

//Sell button event
$("#selBtn").click(function() {
	console.log('SELL CLICKED');
	console.log('VENUE: ' + selectedVenue);
	// Request to SellAction
	var url = '/SellAction';
	var jsonData = { "venue":selectedVenue };
	console.log(jsonData);
	console.log('REQUEST URL: %j', url);
    $.ajax(
		{
            type: 'POST',
            url: '/SellAction',
            data: jsonData,
            success: function (result) {
				console.log('SellAction REQUEST RESULT: ', JSON.stringify(result));
				//Success message
				$("#scsMsgContent").text(result.message.text);
				$("#okMsgModal").show();
				$("#errorMessage").hide();
				//Reload player data on footer
				$("#userCash").text(result.player.cash);
				$("#userNumVenues").text(result.player.numVenues);
            },
            error: function (req, status, error) {
				console.log('ERROR: ' + error);
				console.log('Unable to get SellAction response');
            }
        });
    // Close modal and show message
	$("#freeModal").modal('hide');
	$("#messageModal").modal('show');
});

// OCCUPIED CONTROLS
//Go to Take button event
$("#takeBtn").click(function() {
	//Setup
	// Request to get take cost info
	$.ajax(
		{
			type: 'GET',
			url: '/retrieveTakeCost?venueValue=' + $("#occupiedVenueValue").text(),
			success: function (result) {
				console.log('TAKE COST: ', result);
				if(result.length != 0){
					$("#costTakeValue").text(result.cost);
				}else{
					$("#costTakeValue").text("Unknown Cost");
				}
			},
			error: function (req, status, error) {
				console.log('ERROR: ' + error);
				console.log('Unable to get retrieveTakeCost response');
			}
		});
	$("#takeVenueName").text($("#occupiedVenueName").text());
	$("#takeVenueCategory").text($("#occupiedVenueCategory").text());
	$("#takeVenueIcon").attr("src",$("#occupiedVenueIcon").attr("src"));
	$("#yourMoneyValue").text($("#userCash").text());
	$("#occupiedModal").modal('hide');
	$("#takeModal").modal('show');
});

//Take button event
$("#takeButton").click(function(){
	// Request to TakeAction
	var url = '/TakeAction';
	console.log('REQUEST URL: ', url);
    $.ajax(
		{
            type: 'GET',
            url: '/TakeAction',
            success: function (result) {
				console.log('TakeAction REQUEST RESULT: ', result);
            },
            error: function (req, status, error) {
				console.log('ERROR: ' + error);
				console.log('Unable to get TakeAction response');
            }
        });
});
	
//Pay button event
$("#payBtn").click(function() {
	$("#occupiedModal").modal('hide');
	$("#payModal").modal('show');
	// Request to PayAction
	var url = '/PayAction';
	console.log('REQUEST URL: %j', url);
    $.ajax(
		{
            type: 'GET',
            url: '/PayAction',
            success: function (result) {
				console.log('PayAction REQUEST RESULT: %j', result);
            },
            error: function (req, status, error) {
				console.log('ERROR: ' + error);
				console.log('Unable to get PayAction response');
            }
        });
});
	
//Advertise button event
$("#advBtn").click(function() {
	$("#occupiedModal").modal('hide');
	$("#advertiseModal").modal('show');
	// Request to AdvertiseAction
	var url = '/AdvertiseAction';
	console.log('REQUEST URL: %j', url);
    $.ajax(
		{
            type: 'GET',
            url: '/AdvertiseAction',
            success: function (result) {
				console.log('AdvertiseAction REQUEST RESULT: %j', result);
            },
            error: function (req, status, error) {
				console.log('ERROR: ' + error);
				console.log('Unable to get AdvertiseAction response');
            }
        });
});

// Advertise Next Step 1
$('#btnAdvStp1').click(function(){
  $('.nav-tabs > .active').next('li').find('a').trigger('click');
});

// Advertise Next Step 2
$('#btnAdvStp2').click(function(){
  $('.nav-tabs > .active').next('li').find('a').trigger('click');
});

// Advertise Next Step 3
$('#btnAdvStp3').click(function(){
  $('.nav-tabs > .active').next('li').find('a').trigger('click');
});

// Advertise Next Step 4
$('#btnAdvStp4').click(function(){
  $('.nav-tabs > .active').next('li').find('a').trigger('click');
});
	
//Quiz button event
$("#quzBtn").click(function() {
	$("#occupiedModal").modal('hide');
	$("#quizModal").modal('show');
	// Request to QuizAction
	var url = '/QuizAction';
	console.log('REQUEST URL: %j', url);
    $.ajax(
		{
            type: 'GET',
            url: '/QuizAction',
            success: function (result) {
				console.log('QuizAction REQUEST RESULT: %j', result);
            },
            error: function (req, status, error) {
				console.log('ERROR: ' + error);
				console.log('Unable to get QuizAction response');
            }
        });
});

// Quiz Next Step 1
$('#btnQzStp1').click(function(){
  $('.nav-tabs > .active').next('li').find('a').trigger('click');
});

//Skip button event
$("#skpBtn").click(function() {
	$("#occupiedModal").modal('hide');
	$("#skipModal").modal('show');
	// Request to SkipAction
	var url = '/SkipAction';
	console.log('REQUEST URL: %j', url);
    $.ajax(
		{
            type: 'GET',
            url: '/SkipAction',
            success: function (result) {
				console.log('SkipAction REQUEST RESULT: %j', result);
            },
            error: function (req, status, error) {
				console.log('ERROR: ' + error);
				console.log('Unable to get SkipAction response');
            }
        });
});

// Ok message modal event
$("#okMsgModal").click(function() {
	//Reload updated map
	requestUpdatedMap(lat, lon);
});

// No message modal event
$("#noMsgModal").click(function() {
	//Reload updated map
	requestUpdatedMap(lat, lon);
});