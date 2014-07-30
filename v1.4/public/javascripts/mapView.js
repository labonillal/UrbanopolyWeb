var myMarkersLayer;
var myPositionLayer;
var map;
var loader = document.getElementById('loader');
var lat;
var lon;
var selectedVenue;
var visitJudge;
var visitQuiz;
var visitAdvertise;
var featureRanges = [];
var wheelClicked = 'false';
var looper;
var degrees = 1;
var rotationObjective = 1;

// Function to load the map
$(document).ready(function(){
	// MapBox Map
	map = L.mapbox.map('map', 'lbonillal.i2gblid1').setView([45, 9], 9);
	// Start the loading screen
	startLoading();
	myMarkersLayer = L.mapbox.featureLayer()
		.addTo(map) // Add tiles to the map

	map.locate();

	map.on('locationfound', function(e){
		$("#defaultLocationModal").modal('hide');
		lat = e.latlng.lat;
		lon = e.latlng.lng;
		//Create the map on the location position
		createMap(lat, lon);
	});

	// If the user chooses not to allow their location
	// to be shared, display the default location option.
	map.on('locationerror', function() {
		$("#defaultLocationModal").modal('show');
		//console.log('Position could not be found!');
	});
	// If the user spend more than 10 segs thinking about
	//sharing its location, display the default location option.
	var waitTime = 10000;
	var t = setTimeout(function () {
       if ($("#loader").attr("class") != 'hide') {
            $("#defaultLocationModal").modal('show');
			//console.log('Position could not be found!');
        }
    }, waitTime);
});

// Function to start the loader over the map
function startLoading() {
    loader.className = '';
}

// Function to finish the loader over the map
function finishedLoading() {
    // first, toggle the class 'done', which makes the loading screen
    // fade out
    loader.className = 'done';
    setTimeout(function() {
        // then, after a half-second, add the class 'hide', which hides
        // it completely and ensures that the user can interact with the
        // map again.
        loader.className = 'hide';
    }, 500);
}

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
	//console.log('Location Coordinates: ' + lon +' , ' + lat);

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
    		//console.log(e.layer.feature.properties);
    		//console.log('JSON: ', JSON.stringify(e.layer.feature.properties));
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
    		$('select option[value="base"]').attr("selected", true);
    		//GameWheel
    		$("#GameWheelPanel").empty();
    		degrees = 1;
    		var gameWheel = '<img id="wheelBorder" src="/images/wheel_border.png" alt="wheelBorder"></img>';
			gameWheel +=	'<img id="wheel" src="/images/wheel.png" alt="wheel" style="position: absolute; top: 0px; left: 0px;"></img>';
			gameWheel +=	'<img id="wheelPin" src="/images/wheel_pin.png" alt="wheelPin" style="position: absolute; top: 0px; left: 126px;"></img>';
			$(gameWheel).appendTo('#GameWheelPanel');
    		//Buttons
    		$("#buyBtn").hide();
			$("#mtgBtn").hide();
			$("#rdmBtn").hide();
			$("#selBtn").hide();
			$("#payBtn").hide();
			$("#takeBtn").hide();
			$("#advBtn").hide();
			$("#quzBtn").hide();
			$("#skpBtn").hide();
			//Panels
			$("#venueNamePanel").show();
			$("#venueCategoryPanel").show();
			$("#gameWheelResultPanel").hide();
			//Messages
			$("#successMessage").hide();
			$("#errorMessage").hide();
			//Modals
			$("#okMsgModal").show();
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
			            	//console.log('RENT: ', result);
			            	if(result.length != 0){
								$("#freeVenueRent").text(formatCurrency(result.rent, "€"));
							}else{
								$("#freeVenueRent").text("Unknown Rent");
							}
			            },
			            error: function (req, status, error) {
							console.log('ERROR: ' + error);
							console.log('Unable to get retrieveVenueRent response');
			            }
			        });
    			// Clean Mortgage End
				$("#freeVenueMortgageDeadTime").text('');
				$("#freeVenueMortgageLabel").text('');
    			// Enable buy button
    			$("#buyBtn").show();
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
    			$("#freeVenueValue").text(formatCurrency(e.layer.feature.properties.value, "€"));
    			// Show modal
    			$("#freeModal").modal('show');
    		}
    		//Occupied Venue
    		else if(e.layer.feature.properties["state"] == 'OCCUPIED'){
    			if(e.layer.feature.properties["name"] != null){
    				$("#occupiedVenueName").text(e.layer.feature.properties.name);
    				$("#takeInputVenueName").val(e.layer.feature.properties.name);
    				$("#advertiseInputVenueName").val(e.layer.feature.properties.name);
    			}else{
    				$("#occupiedVenueName").text("Unnamed Venue");
    				$("#takeInputVenueName").val("Unnamed Venue");
    				$("#advertiseInputVenueName").val("Unnamed Venue");
    			}
    			$("#occupiedVenueIcon").attr("src",e.layer.feature.properties.icon.iconUrl);
    			$("#occupiedVenueValue").text(formatCurrency(e.layer.feature.properties.value, "€"));
    			// Game Wheel Result
    			var wheel = e.layer.feature.properties.wheel;
    			wheelClicked = 'false';
    			var wheelAction = getGameWheelAction(wheel);
    			switch(wheelAction){
    				case 'PAY':
    					rotationObjective = 555;
    					$("#resultTitle").attr("src",'/images/title_pay.png');
    					$("#resultTitle").attr("width",'105');
    					$("#resultTitle").attr("height",'25');
    					$("#resultDescription").text('Oh no! You have to pay the entrance fee!');
    					$("#payBtn").show();
						break;
					case 'TAKE':
						rotationObjective = 525;
						$("#resultTitle").attr("src",'/images/title_take.png');
						$("#resultTitle").attr("width",'105');
    					$("#resultTitle").attr("height",'25');
						$("#resultDescription").text('You have the chance to take possession of this Venue against its Owner\'s will! But you have to pay 150% of its value');
						$("#takeBtn").show();
						break;
					case 'ADVERTISE':
						rotationObjective = 495;
						$("#resultTitle").attr("src",'/images/title_advertise.png');
						$("#resultTitle").attr("width",'146');
    					$("#resultTitle").attr("height",'25');
						$("#resultDescription").text('Ok, you have been hired to produce an Advertisement Poster for this Venue\nYou will be asked to provide the inputs to complete the Poster; you\'ll be paid for each provided input.\nTake care! If you insert the wrong input your Karma will punish you!');
						$("#advBtn").show();
						break;
					case 'QUIZ':
						rotationObjective = 465;
						$("#resultTitle").attr("src",'/images/title_quiz.png');
						$("#resultTitle").attr("width",'105');
    					$("#resultTitle").attr("height",'25');
						$("#resultDescription").text('Hey, Mr. Expert, are you ready to gain money? You\'ll be asked from 1 to 3 questions about this Venue. In each quiz, choose at least 1 of the provided options or declare your ignorance on the subject: we appreciate your expertise.. and also your limits!');
						$("#quzBtn").show();
						break;
					default:
						rotationObjective = 615;
						$("#resultTitle").attr("src",'/images/title_skip.png');
						$("#resultTitle").attr("width",'105');
    					$("#resultTitle").attr("height",'25');
						$("#resultDescription").text('Wow, you skipped the misfortune. And you also earned some money!');
						$("#skpBtn").show();
						break;
    			}
    			// Quiz Modal Setup
    			$("#quizTabsNav").empty();
    			$("#quizTabsContent").empty();
    			// If venue have quiz info
				if(typeof e.layer.feature.properties.quiz != 'undefined'){
					visitQuiz = e.layer.feature.properties.quiz;
					visitQuiz.selected = [];
					visitQuiz.skips = [];
					var questions = e.layer.feature.properties.quiz["questions"];
					//$("#quizContent").text("QUIZ CONTENT: " + questions);
					var options = e.layer.feature.properties.quiz["options"];
					//console.log('QUESTIONS: ', questions);
					//console.log('OPTIONS: ', options);
					var currentStep = 0;
					var nextStep = 1;
					for(var i in questions){
						var question = questions[i];
						currentStep++;
						nextStep++;
						if(i == 0){
							//Nav tab active
							$('<li class="active"><a href="#qzStep'+ currentStep +'" data-toggle="tab"> <strong>Question '+ currentStep +'</strong> </a> </li>').appendTo('#quizTabsNav');
							//Tab pane active
							var content =	'<div class="tab-pane active" id="qzStep'+ currentStep +'">';
								content +=		'<div class="panel">';
								content +=			'<div class="panel-heading">';
								content +=				'<div class="alert alert-info">';
								content +=					'<strong>'+ currentStep +'.</strong> '+ question +'.';
								content +=				'</div>';
								content +=			'</div>';
								content +=		'<div class="panel-body">';
							if(options[i][2] != null && options[i][3] != null){
								content += 			'<div style="text-align:left">';
								content +=				'<div class="radio">';
								content +=					'<input type="checkbox" name="optionsRadios" id="optionsRadios1" value="0">';
								content +=						options[i][0];
								content +=					'</input>';
								content +=				'</div>';
								content +=				'<div class="radio">';
								content +=					'<input type="checkbox" name="optionsRadios" id="optionsRadios2" value="1">';
								content +=						options[i][1];
								content +=					'</input>';
								content +=				'</div>';
								content +=				'<div class="radio">';
								content +=					'<input type="checkbox" name="optionsRadios" id="optionsRadios3" value="2">';
								content +=						options[i][2];
								content +=					'</input>';
								content +=				'</div>';
								content +=				'<div class="radio">';
								content +=					'<input type="checkbox" name="optionsRadios" id="optionsRadios4" value="3">';
								content +=						options[i][3];
								content +=					'</input>';
								content +=				'</div>';
								content +=				'<div style="text-align:center">';
								if(i == questions.length - 1){
									content += '<a id="finishQz" href="#qzStep'+ nextStep +'" class="btn btn-primary" data-dismiss="modal"> Finish </a> </div>';
								}else{
									content += '<a id="nextQzStp'+ currentStep +'" href="#qzStep'+ nextStep +'" class="btn btn-primary" data-toggle="tab"> Next </a> </div>';
								}
							}else{
								content +=	'<div style="text-align:center">';
								if(i == questions.length - 1){
									content += '<a id="yesFinishQz" href="#qzStep'+ nextStep +'" class="btn btn-primary" data-dismiss="modal"> Yes </a>';
									content += '<a id="noFinishQz" href="#qzStep'+ nextStep +'" class="btn btn-primary" data-dismiss="modal"> No </a>';
									content += '<a id="idkFinishQz" href="#qzStep'+ nextStep +'" class="btn btn-primary" data-dismiss="modal"> I dont know </a> </div>';
								}else{
									content += '<a id="yesStp'+ currentStep +'" href="#qzStep'+ nextStep +'" class="btn btn-primary" data-toggle="tab"> Yes </a>';
									content += '<a id="noStp'+ currentStep +'" href="#qzStep'+ nextStep +'" class="btn btn-primary" data-toggle="tab"> No </a>';
									content += '<a id="idkStp'+ currentStep +'" href="#qzStep'+ nextStep +'" class="btn btn-primary" data-toggle="tab"> I dont know </a> </div>';
								}
							}
							content += '</div> </div> </div>';
							//Adding the content
							$(content).appendTo('#quizTabsContent');
						}else{
							//Nav tab
							$('<li> <a href="#qzStep'+ currentStep +'" data-toggle="tab"> <strong>Question '+ currentStep +'</strong> </a></li>').appendTo('#quizTabsNav');
							//Tab pane
							var content = '<div class="tab-pane" id="qzStep'+ currentStep +'">';
								content +=		'<div class="panel">';
								content +=			'<div class="panel-heading">';
								content +=				'<div class="alert alert-info">';
								content +=					'<strong>'+ currentStep +'.</strong> '+ question +'.';
								content +=				'</div>';
								content +=			'</div>';
								content +=			'<div class="panel-body">';
							if(options[i][2] != null && options[i][3] != null){
								content +=  '<div class="radio">';
								content +=		'<input type="checkbox" name="optionsRadios" id="optionsRadios1" value="0">';
								content +=			options[i][0];
								content +=		'</input>';
								content +=	'</div>';
								content +=  '<div class="radio">';
								content +=		'<input type="checkbox" name="optionsRadios" id="optionsRadios2" value="1">';
								content +=			options[i][1];
								content +=		'</input>';
								content +=	'</div>';
								content +=	'<div class="radio">';
								content +=		'<input type="checkbox" name="optionsRadios" id="optionsRadios3" value="2">';
								content +=			options[i][2];
								content +=		'</input>';
								content +=	'</div>';
								content +=	'<div class="radio">';
								content +=		'<input type="checkbox" name="optionsRadios" id="optionsRadios4" value="3">';
								content +=			options[i][3];
								content +=		'</input>';
								content +=	'</div>';
								content +=	'<div style="text-align:center">';
								if(i == questions.length - 1){
									content += '<a id="finishQz" href="#qzStep'+ nextStep +'" class="btn btn-primary" data-dismiss="modal"> Finish </a> </div>';
								}else{
									content += '<a id="nextQzStp'+ currentStep +'" href="#qzStep'+ nextStep +'" class="btn btn-primary" data-toggle="tab"> Next </a> </div>';
								}
							}else{
								content += '<div style="text-align:center">';
								if(i == questions.length - 1){
									content += '<a id="yesFinishQz" href="#qzStep'+ nextStep +'" class="btn btn-primary" data-dismiss="modal"> Yes </a>';
									content += '<a id="noFinishQz" href="#qzStep'+ nextStep +'" class="btn btn-primary" data-dismiss="modal"> No </a>';
									content += '<a id="idkFinishQz" href="#qzStep'+ nextStep +'" class="btn btn-primary" data-dismiss="modal"> I dont know </a> </div>';
								}else{
									content += '<a id="yesStp'+ currentStep +'" href="#qzStep'+ nextStep +'" class="btn btn-primary" data-toggle="tab"> Yes </a>';
									content += '<a id="noStp'+ currentStep +'" href="#qzStep'+ nextStep +'" class="btn btn-primary" data-toggle="tab"> No </a>';
									content += '<a id="idkStp'+ currentStep +'" href="#qzStep'+ nextStep +'" class="btn btn-primary" data-toggle="tab"> I dont know </a> </div>';
								}				
							}
							content += '</div> </div> </div>';
							//Adding the content
							$(content).appendTo('#quizTabsContent');
						}
	    			}
	    		}
    			// Advertise Modal Setup
				//$("#advertiseTabsNav").empty();
				$("#adv2").remove();
				$("#adv3").remove();
				$("#adv4").remove();
				//$("#advertiseTabsContent").empty();
				$("#advStep2").remove();
				$("#advStep3").remove();
				$("#advStep4").remove();
    			// If venue have advertise info
    			if(typeof e.layer.feature.properties.advertise != 'undefined'){
    				visitAdvertise = e.layer.feature.properties.advertise;
    				var featureTypes = e.layer.feature.properties.advertise["featureTypes"];
    				//$("#advertiseContent").text("ADVERTISE CONTENT: " + featureTypes);
    				//console.log('ADV QUESTIONS: ', featureTypes.length - 1);
    				//for(var k=0; k < featureTypes.length; k++){
    				//	console.log(k + '. ' + featureTypes[k].advertiseQuestion);
    				//}
    				//$(featureTypes.advertiseQuestion).appendTo('#advertiseContent');
    				var currentStep = 1;
					var nextStep = 2;
    				for(var i in featureTypes){
    					var featureType = featureTypes[i];
    					//console.log('featureType['+i+'] : ', featureType);
						currentStep++;
						nextStep++;
						//Nav tab
						$('<li id= "adv'+ currentStep +'"> <a href="#advStep'+ currentStep +'" data-toggle="tab"> <strong>Step '+ currentStep +'</strong> </a></li>').appendTo('#advertiseTabsNav');
						//Tab pane
						var content =	'<div class="tab-pane" id="advStep'+ currentStep +'">';
							content +=		'<div class="panel">';
							content +=			'<div class="panel-heading">';
							//Type of question
							if(featureType.featureRange.type == 'open'){
								content +=	'<img id="gain_3000" src="/images/gain_3000.png" alt="gain_3000" style="position: absolute; top: 0px; right: 0px;"> </img>';
							}else if(featureType.featureRange.type == 'closed'){
								content +=	'<img id="gain_1000" src="/images/gain_1000.png" alt="gain_1000" style="position: absolute; top: 0px; right: 0px;"> </img>';
							}else{
								content +=	'<img id="gain_2000" src="/images/gain_2000.png" alt="gain_2000" style="position: absolute; top: 0px; right: 0px;"> </img>';
							}
							content +=				'<div class="alert alert-info">';
							content +=					'<strong>'+ currentStep +'.</strong> '+ featureType.advertiseQuestion +'.';
							content +=				'</div>';
							content +=				'<div style="text-align:center">';
							content +=					'<input id="advStep'+ currentStep +'Input" type="text" class="form-control">';
							content +=					'<span class="help-block">Insert your answer here.</span>'
							content +=				'</div>';
							content +=			'</div>';
							content +=			'<div class="panel-body">';
							content +=				'<div style="text-align:center">';
						if(i == featureTypes.length - 1){
							content += '<a id="okAdvStp'+ currentStep +'" href="#advStep'+ nextStep +'" class="btn btn-primary" data-dismiss="modal"> Ok </a>';
							content += '<a id="idkAdvStp'+ currentStep +'" href="#advStep'+ nextStep +'" class="btn btn-primary" data-dismiss="modal"> I dont know </a>';
							content += '<a id="finishAdvStp'+ currentStep +'" class="btn btn-primary" data-dismiss="modal"> Finish </a> </div>';
						}else{
							content += '<a id="okAdvStp'+ currentStep +'" href="#advStep'+ nextStep +'" class="btn btn-primary" data-toggle="tab"> Ok </a>';
							content += '<a id="idkAdvStp'+ currentStep +'" href="#advStep'+ nextStep +'" class="btn btn-primary" data-toggle="tab"> I dont know </a>';
							content += '<a id="finishAdvStp'+ currentStep +'" class="btn btn-primary" data-dismiss="modal"> Finish </a> </div>';
						}
						content += '</div> </div> </div>';
						//Adding the content
						$(content).appendTo('#advertiseTabsContent');
					}
   				}
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
			            	//console.log('RENT: ', result);
			            	if(result.length != 0){
								$("#freeVenueRent").text(formatCurrency(result.rent, "€"));
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
    			$("#freeVenueValue").text(formatCurrency(e.layer.feature.properties.value, "€"));
    			// Enable sell button
    			$("#selBtn").show();
    			if (e.layer.feature.properties["state"] == 'MINE'){
    				// Clean Mortgage End
					$("#freeVenueMortgageDeadTime").text('');
					$("#freeVenueMortgageLabel").text('');
    				// Enable mortgage button
    				$("#mtgBtn").show();
    			}
    			else if (e.layer.feature.properties["state"] == 'MINE_MORTGAGED'){
    				// Show Mortgage End
    				var day = e.layer.feature.properties.deadTime.dayOfMonth;
    				var month = e.layer.feature.properties.deadTime.month + 1;
    				var year = e.layer.feature.properties.deadTime.year;
    				var deadTime = day + '/' + month + '/' + year;
    				//console.log('DEADTIME: ', deadTime);
    				$("#freeVenueMortgageDeadTime").text(deadTime);
    				$("#freeVenueMortgageLabel").text('Mortgage End');
    				// Enable redeem button
    				$("#rdmBtn").show();
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
	//console.log('REQUEST URL: ',temp);
    $.ajax(
		{
            type: 'GET',
            url: '/RetrieveMap?lat=' + lat + '&lon=' + lon,
            success: function (result) {
            	if(result != ""){
            		myMarkersLayer.setGeoJSON(result);
					map.fitBounds(myMarkersLayer.getBounds());
					finishedLoading(); // When the tiles load, remove the loading screen;
					//console.log('requestUpdatedMap finish...')
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

function getGameWheelAction(wheel){
	console.log('getGameWheelAction Starts...');
	var wheelAction;
	//Create the random int
	var randomInt = Math.random() * 100;
	//console.log('RANDOM INT: ', randomInt);
	//Define answer thresholds
	var takeThreshold = wheel.takePercentage;
	//console.log('takeThreshold: ', takeThreshold);
	var skipThreshold = takeThreshold + wheel.skipPercentage;
	//console.log('skipThreshold: ', skipThreshold);
	var payThreshold = skipThreshold + wheel.payPercentage;
	//console.log('payThreshold: ', payThreshold);
	var advertiseThreshold = payThreshold + wheel.advertisePercentage;
	//console.log('advertiseThreshold: ', advertiseThreshold);
	var quizThreshold = advertiseThreshold + wheel.quizPercentage;
	//console.log('quizThreshold: ', quizThreshold);
	//Find the answer
	if(0 < randomInt && randomInt <= takeThreshold){
		wheelAction = 'TAKE';
	}else if(takeThreshold < randomInt && randomInt <= skipThreshold){
		wheelAction = 'SKIP';
	}else if(skipThreshold < randomInt && randomInt <= payThreshold){
		wheelAction = 'PAY';
	}else if (payThreshold < randomInt && randomInt <= advertiseThreshold){
		wheelAction = 'ADVERTISE';
	}else if(advertiseThreshold < randomInt && randomInt <= quizThreshold){
		wheelAction = 'QUIZ';
	}else{
		wheelAction = 'SKIP';
	}
	//console.log('wheelAction: ', wheelAction);
	console.log('getGameWheelAction Finish...');
	return wheelAction;
};

//GameWheel Rotation function
function rotateAnimation(objective){
	var elem = document.getElementById("wheel");

	setTimeout(function () {    //  call a 1s setTimeout when the loop is called
		if(navigator.userAgent.match("Chrome")){
			elem.style.WebkitTransform = "rotate("+degrees+"deg)";
		}else if(navigator.userAgent.match("Firefox")){
			elem.style.MozTransform = "rotate("+degrees+"deg)";
		}else if(navigator.userAgent.match("MSIE")){
			elem.style.msTransform = "rotate("+degrees+"deg)";
		}else if(navigator.userAgent.match("Opera")){
			elem.style.OTransform = "rotate("+degrees+"deg)";
		}else {
			elem.style.transform = "rotate("+degrees+"deg)";
		}
		degrees++;						//  increment the counter
		if (degrees < objective) {		//  if the counter < 10, call the loop function
			rotateAnimation(objective);		//  ..  again which will trigger another 
		}else{
			//console.log('Actual degrees: ', degrees);
			$("#venueNamePanel").hide();
			$("#venueCategoryPanel").hide();
			$("#gameWheelResultPanel").show();
		}									//  ..  setTimeout()
	},1)
}

//GameWheel Spin event
$('#GameWheelPanel').on( "click", "img", function(event) {
	//If the wheel isn't spining yet
	if(wheelClicked == 'false'){
		rotateAnimation(rotationObjective);
	}
	wheelClicked = 'true';
});

// Default Location Controls
$("#location1").click(function() {
	lat = 45.464098; //45.480265;
	lon = 9.191926; //9.223666;
	createMap(45.464098, 9.191926);
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
	lat = 45.811847; //45.8124104;
	lon = 9.083665; //9.0928468;
	createMap(45.811847, 9.083665);
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
	//console.log($("#parentSelect").val());
	// Clean childSelect
	$("#childSelect").empty();
	$("#childSelect").append("<option> Please Select </option>");
	// Request to retrieveChildCategories
	var url = '/retrieveChildCategories';
	//console.log('REQUEST URL: ', url);
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
	//console.log('BUY CLICKED');
	var inputVenueName = $("#inputVenueName").val();
	var parentCategory = $("#parentSelect").val();
	var childCategory = $("#childSelect").val();
	//console.log('VENUE: ' + selectedVenue);
	//console.log('VENUE NAME: ' + inputVenueName);
	//console.log('VENUE PARENT CATEGORY: ' + parentCategory + ' NAME: ' + $("#parentSelect option:selected").text());
	//console.log('VENUE CHILD CATEGORY: ' + childCategory  + ' NAME: ' + $("#childSelect option:selected").text());
	// Request to BuyAction
	var url = '/BuyAction';
	var jsonData = {"venueCategory":childCategory,"venueName":inputVenueName,"venue":selectedVenue };
	//console.log(jsonData);
	//console.log('REQUEST URL: ', url);
    $.ajax(
		{
            type: 'POST',
            url: '/BuyAction',
            data: jsonData,
            success: function (result) {
				//console.log('BuyAction REQUEST RESULT: ', JSON.stringify(result));
				if(result.visit == null){
					//Error message
					//console.log('MESSAGE: ', result.message.text);
					$("#errMsgContent").text(result.message.text);
					$("#errorMessage").show();
				}else{
					//Success message
					$("#scsMsgContent").text(result.message.text);
					$("#successMessage").show();
					$("#okMsgModal").hide();
					$("#yesMsgModal").show();
					$("#noMsgModal").show();
					$("#errorMessage").hide();
				}
				//Reload player data on footer
				$("#userCash").text(formatCurrency(result.player.cash));
				$("#userNumVenues").text(result.player.numVenues);
            },
            error: function (req, status, error) {
				console.log('ERROR: ' + error);
				console.log('Unable to get BuyAction response');
				$("#errorMessage").show();
            }
        });
    // Close modal and show message
	$("#buyModal").modal('hide');
	$("#messageModal").modal('show');
});

//Mortgage button event
$("#mtgBtn").click(function() {
	//console.log('MORTGAGE CLICKED');
	//console.log('VENUE: ' + selectedVenue);
	// Request to MortgageAction
	var url = '/MortgageAction';
	var jsonData = { "venue":selectedVenue };
	//console.log(jsonData);
	//console.log('REQUEST URL:' , url);
    $.ajax(
		{
            type: 'POST',
            url: '/MortgageAction',
            data: jsonData,
            success: function (result) {
				//console.log('MortgageAction REQUEST RESULT: ', JSON.stringify(result));
				//Success message
				$("#scsMsgContent").text(result.message.text);
				$("#successMessage").show();
				//Reload player data on footer
				$("#userCash").text(formatCurrency(result.player.cash));
				$("#userNumVenues").text(result.player.numVenues);
            },
            error: function (req, status, error) {
				console.log('ERROR: ' + error);
				console.log('Unable to get MortgageAction response');
				$("#errorMessage").show();
            }
        });
    // Close modal and show message
	$("#freeModal").modal('hide');
	$("#messageModal").modal('show');
});

//Redeem button event
$("#rdmBtn").click(function() {
	//console.log('REDEEM CLICKED');
	//console.log('VENUE: ' + selectedVenue);
	// Request to RedeemAction
	var url = '/RedeemAction';
	var jsonData = { "venue":selectedVenue };
	//console.log(jsonData);
	//console.log('REQUEST URL: ', url);
    $.ajax(
		{
            type: 'POST',
            url: '/RedeemAction',
            data: jsonData,
            success: function (result) {
				//console.log('RedeemAction REQUEST RESULT: ', JSON.stringify(result));
				//Success message
				$("#scsMsgContent").text(result.message.text);
				$("#successMessage").show();
				//Reload player data on footer
				$("#userCash").text(formatCurrency(result.player.cash));
				$("#userNumVenues").text(result.player.numVenues);
            },
            error: function (req, status, error) {
				console.log('ERROR: ' + error);
				console.log('Unable to get RedeemAction response');
				$("#errorMessage").show();
            }
        });
    // Close modal and show message
	$("#freeModal").modal('hide');
	$("#messageModal").modal('show');
});

//Sell button event
$("#selBtn").click(function() {
	//console.log('SELL CLICKED');
	//console.log('VENUE: ' + selectedVenue);
	// Request to SellAction
	var url = '/SellAction';
	var jsonData = { "venue":selectedVenue };
	//console.log(jsonData);
	//console.log('REQUEST URL: %j', url);
    $.ajax(
		{
            type: 'POST',
            url: '/SellAction',
            data: jsonData,
            success: function (result) {
				//console.log('SellAction REQUEST RESULT: ', JSON.stringify(result));
				//Success message
				$("#scsMsgContent").text(result.message.text);
				$("#successMessage").show();
				//Reload player data on footer
				$("#userCash").text(formatCurrency(result.player.cash));
				$("#userNumVenues").text(result.player.numVenues);
            },
            error: function (req, status, error) {
				console.log('ERROR: ' + error);
				console.log('Unable to get SellAction response');
				$("#errorMessage").show();
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
	var venue = JSON.parse(selectedVenue);
	// Request to get take cost info
	$.ajax(
		{
			type: 'GET',
			url: '/retrieveTakeCost?venueValue=' + venue["value"],
			success: function (result) {
				//console.log('TAKE COST: ', result);
				if(result.length != 0){
					$("#costTakeValue").text(formatCurrency(result.cost, "€"));
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
	$("#yourMoneyValue").text("€ " + $("#userCash").text());
	$("#occupiedModal").modal('hide');
	$("#takeCostModal").modal('show');
});

//Take modal info event
$("#takeInfoButton").click(function(){
	$("#takeCostModal").modal('hide');
	$("#takeModal").modal('show');
	$('#takeParentPanel').hide();
	$('#takeChildPanel').hide();
	$('#takeButton').prop('disabled', true);
});

//Take insert name ok event
$("#takeInsertNameOk").click(function() {
	$('#takeParentPanel').show();
});

//Parent category selection event
$("#takeParentSelect").change(function() {
	//console.log($("#takeParentSelect").val());
	// Clean childSelect
	$("#takeChildSelect").empty();
	$("#takeChildSelect").append("<option> Please Select </option>");
	// Request to retrieveChildCategories
	var url = '/retrieveChildCategories';
	//console.log('REQUEST URL: ', url);
    $.ajax(
		{
            type: 'GET',
            url: '/retrieveChildCategories?category=' + $("#takeParentSelect option:selected").text(),
            success: function (result) {
            	if(result.length != 0){
					for(var i in result){
						$("#takeChildSelect").append("<option value=" + result[i].id + ">" + result[i].name + "</option>");
					}
				}else{
					$('#takeChildPanel').hide();
				}

            },
            error: function (req, status, error) {
				console.log('ERROR: ' + error);
				console.log('Unable to get retrieveChildCategories response');
            }
        });
	$('#takeChildPanel').show();
});

//Take child selection event
$("#takeChildSelect").change(function() {
	$('#takeButton').prop('disabled', false);
});

//Take button event
$("#takeButton").click(function(){
	//console.log('TAKE CLICKED');
	var takeInputVenueName = $("#takeInputVenueName").val();
	var takeParentCategory = $("#takeParentSelect").val();
	var takeChildCategory = $("#takeChildSelect").val();
	//console.log('VENUE: ' + selectedVenue);
	//console.log('VENUE NAME: ' + takeInputVenueName);
	//console.log('VENUE PARENT CATEGORY: ' + takeParentCategory + ' NAME: ' + $("#takeParentSelect option:selected").text());
	//console.log('VENUE CHILD CATEGORY: ' + takeChildCategory  + ' NAME: ' + $("#takeChildSelect option:selected").text());
	// Request to TakeAction
	var url = '/TakeAction';
	var jsonData = {"venueCategory":takeChildCategory,"venueName":takeInputVenueName,"venue":selectedVenue };
	//console.log(jsonData);
	//console.log('REQUEST URL: ', url);
    $.ajax(
		{
            type: 'POST',
            url: '/TakeAction',
            data: jsonData,
            success: function (result) {
				//console.log('TakeAction REQUEST RESULT: ', JSON.stringify(result));
				//Success message
				$("#scsMsgContent").text(result.message.text);
				$("#successMessage").show();
				$("#okMsgModal").hide();
				$("#yesMsgModal").show();
				$("#yesMsgModal").attr("disabled", "disabled");
				$("#noMsgModal").show();
				//Reload player data on footer
				$("#userCash").text(formatCurrency(result.player.cash));
				$("#userNumVenues").text(result.player.numVenues);
            },
            error: function (req, status, error) {
				console.log('ERROR: ' + error);
				console.log('Unable to get TakeAction response');
				$("#errorMessage").show();
            }
        });
   	// Close modal and show message
	$("#takeModal").modal('hide');
	$("#messageModal").modal('show');
});
	
//Go to pay button event
$("#payBtn").click(function() {
	var venue = JSON.parse(selectedVenue);
	//console.log('VENUE: ' + venue);
	// Request to get rent info
	var url = '/retrieveVenueRent?venueValue=' + venue["value"];
	//console.log('REQUEST URL: ', url);
    $.ajax(
		{
			type: 'GET',
			url: url,			
			success: function (result) {
			    //console.log('RENT: ', result);
			    if(result.length != 0){
					$("#costPayValue").text(formatCurrency(result.rent, "€"));
				}else{
					$("#costPayValue").text("Unknown Fee");
				}
			},
			error: function (req, status, error) {
				console.log('ERROR: ' + error);
				console.log('Unable to get retrieveVenueRent response');
			}
        });

	$("#payVenueName").text($("#occupiedVenueName").text());
	$("#payVenueCategory").text($("#occupiedVenueCategory").text());
	$("#payVenueIcon").attr("src",$("#occupiedVenueIcon").attr("src"));
	$("#payYourMoneyValue").text("€ " + $("#userCash").text());
	$("#occupiedModal").modal('hide');
	$("#payModal").modal('show');
});

//Pay button event
$("#payButton").click(function() {
	//console.log('PAY CLICKED');
	// Request to PayAction
	var url = '/PayAction';
	var jsonData = {"venue":selectedVenue };
	//console.log(jsonData);
	//console.log('REQUEST URL: %j', url);
    $.ajax(
		{
            type: 'POST',
            url: '/PayAction',
            data: jsonData,
            success: function (result) {
				//console.log('PayAction REQUEST RESULT: %j', result);
				//Success message
				$("#scsMsgContent").text(result.message.text);
				$("#successMessage").show();
				//Reload player data on footer
				$("#userCash").text(formatCurrency(result.player.cash));
				$("#userNumVenues").text(result.player.numVenues);
            },
            error: function (req, status, error) {
				console.log('ERROR: ' + error);
				console.log('Unable to get PayAction response');
				$("#errorMessage").show();
            }
        });
    // Close modal and show message
	$("#payModal").modal('hide');
	$("#messageModal").modal('show');
});
	
//Advertise button event
$("#advBtn").click(function() {
	$("#adv1").attr('class', 'active');
	$("#advStep1").attr('class', 'tab-pane active');
	$("#occupiedModal").modal('hide');
	$("#advertiseModal").modal('show');
	$('#advertiseParentPanel').hide();
	$('#advertiseChildPanel').hide();
	$('#nextAdvStp1').hide();
});

//Advertise insert name ok event
$("#advertiseInsertNameOk").click(function() {
	$('#advertiseParentPanel').show();
});

//Parent category selection event
$("#advertiseParentSelect").change(function() {
	//console.log($("#advertiseParentSelect").val());
	// Clean childSelect
	$("#advertiseChildSelect").empty();
	$("#advertiseChildSelect").append("<option> Please Select </option>");
	// Request to retrieveChildCategories
	var url = '/retrieveChildCategories';
	//console.log('REQUEST URL: ', url);
	$.ajax(
		{
			type: 'GET',
			url: '/retrieveChildCategories?category=' + $("#advertiseParentSelect option:selected").text(),
			success: function (result) {
				if(result.length != 0){
					for(var i in result){
						$("#advertiseChildSelect").append("<option value=" + result[i].id + ">" + result[i].name + "</option>");
					}
				}else{
					$('#advertiseChildPanel').hide();
				}
			},
			error: function (req, status, error) {
				console.log('ERROR: ' + error);
				console.log('Unable to get retrieveChildCategories response');
			}
		});
	$('#advertiseChildPanel').show();
});

//Advertise child selection event
$("#advertiseChildSelect").change(function() {
	$('#nextAdvStp1').show();
});

// Advertise Next StepX Event
$('#advertiseTabsContent').on( "click", "a.btn", function(event){
	//console.log(event.target.id + ' BUTTON CLICKED!');
	var inputValue;
	switch(event.target.id) {
		case 'okAdvStp2':
			if(visitAdvertise.featureTypes[0].featureRange.type == 'open'){
				//Save the type of the question
				featureRanges[0] = 'open';
				//Take the value of the text input
				inputValue = $("#advStep2Input").val();
				//console.log(inputValue);
				visitAdvertise.featureValues[0] = inputValue;
			}else{
				//Save the type of the question
				featureRanges[0] = 'closed';
				//Take the value of the options
				inputValue = $("#advStep2Input").val();
				//console.log(inputValue);
				visitAdvertise.featureValues[0] = inputValue;
			}
			//mark the feature like responded
			visitAdvertise.skips[0] = 'false';
			break;
		case 'idkAdvStp2':
			if(visitAdvertise.featureTypes[0].featureRange.type == 'open'){
				featureRanges[0] = 'open';
				visitAdvertise.featureValues[0] = 'undefined';
			}else{
				featureRanges[0] = 'closed';
				visitAdvertise.featureValues[0] = 'undefined';
			}
			visitAdvertise.skips[0] = 'false';
			break;
		case 'finishAdvStp2':
			visitAdvertise.featureValues[0] = 'undefined';
			featureRanges[0] = 'undefined';
			visitAdvertise.skips[0] = 'true';
			visitAdvertise.skips[1] = 'true';
			visitAdvertise.skips[2] = 'true';
			advertise(visitAdvertise.featureValues, visitAdvertise.skips, featureRanges);
			//console.log('VISIT ADVERTISE :', visitAdvertise);
			//console.log('FEATURE VALUES :', visitAdvertise.featureValues);
			//console.log('SKIPS :', visitAdvertise.skips);
			//console.log('FEATURE RANGES :', featureRanges);
			break;
		case 'okAdvStp3':
			if(visitAdvertise.featureTypes[1].featureRange.type == 'open'){
				//Save the type of the question
				featureRanges[1] = 'open';
				//Take the value of the text input
				inputValue = $("#advStep3Input").val();
				//console.log(inputValue);
				visitAdvertise.featureValues[1] = inputValue;
			}else{
				//Save the type of the question
				featureRanges[1] = 'closed';
				//Take the value of the options
				inputValue = $("#advStep2Input").val();
				//console.log(inputValue);
				visitAdvertise.featureValues[1] = inputValue;
			}
			//mark the feature like responded
			visitAdvertise.skips[1] = 'false';
			break;
		case 'idkAdvStp3':
			if(visitAdvertise.featureTypes[1].featureRange.type == 'open'){
				featureRanges[1] = 'open';
				visitAdvertise.featureValues[1] = 'undefined';
			}else{
				featureRanges[1] = 'closed';
				visitAdvertise.featureValues[1] = 'undefined';
			}
			visitAdvertise.skips[1] = 'false';
			break;
		case 'finishAdvStp3':
			visitAdvertise.featureValues[1] = 'undefined';
			featureRanges[1] = 'undefined';
			visitAdvertise.skips[1] = 'true';
			visitAdvertise.skips[2] = 'true';
			advertise(visitAdvertise.featureValues, visitAdvertise.skips, featureRanges);
			//console.log('VISIT ADVERTISE :', visitAdvertise);
			//console.log('FEATURE VALUES :', visitAdvertise.featureValues);
			//console.log('SKIPS :', visitAdvertise.skips);
			//console.log('FEATURE RANGES :', featureRanges);
			break;
		case 'okAdvStp4':
			if(visitAdvertise.featureTypes[2].featureRange.type == 'open'){
				//Save the type of the question
				featureRanges[2] = 'open';
				//Take the value of the text input
				inputValue = $("#advStep4Input").val();
				//console.log(inputValue);
				visitAdvertise.featureValues[2] = inputValue;
			}else{
				//Save the type of the question
				featureRanges[2] = 'closed';
				//Take the value of the options
				inputValue = $("#advStep2Input").val();
				//console.log(inputValue);
				visitAdvertise.featureValues[2] = inputValue;
			}
			//mark the feature like responded
			visitAdvertise.skips[2] = 'false';
			advertise(visitAdvertise.featureValues, visitAdvertise.skips, featureRanges);
			//console.log('VISIT ADVERTISE :', visitAdvertise);
			//console.log('FEATURE VALUES :', visitAdvertise.featureValues);
			//console.log('SKIPS :', visitAdvertise.skips);
			//console.log('FEATURE RANGES :', featureRanges);
			break;
		case 'idkAdvStp4':
			if(visitAdvertise.featureTypes[2].featureRange.type == 'open'){
				featureRanges[2] = 'open';
				visitAdvertise.featureValues[2] = 'undefined';
			}else{
				featureRanges[2] = 'closed';
				visitAdvertise.featureValues[2] = 'undefined';
			}
			visitAdvertise.skips[2] = 'false';
			advertise(visitAdvertise.featureValues, visitAdvertise.skips, featureRanges);
			//console.log('VISIT ADVERTISE :', visitAdvertise);
			//console.log('FEATURE VALUES :', visitAdvertise.featureValues);
			//console.log('SKIPS :', visitAdvertise.skips);
			//console.log('FEATURE RANGES :', featureRanges);
			break;
		case 'finishAdvStp4':
			visitAdvertise.featureValues[2] = 'undefined';
			featureRanges[2] = 'undefined';
			visitAdvertise.skips[2] = 'true';
			advertise(visitAdvertise.featureValues, visitAdvertise.skips, featureRanges);
			//console.log('VISIT ADVERTISE :', visitAdvertise);
			//console.log('FEATURE VALUES :', visitAdvertise.featureValues);
			//console.log('SKIPS :', visitAdvertise.skips);
			//console.log('FEATURE RANGES :', featureRanges);
			break;
		default:
			break;
	}
	$('.nav-tabs > .active').next('li').find('a').trigger('click');
});

function advertise(featureValues, skips, featureRanges){
	//console.log('START ADVETISING...');
	var advertiseChildCategory = $("#advertiseChildSelect").val();
	var advertiseInputVenueName = $("#advertiseInputVenueName").val();
	// Request to AdvertiseAction
	var url = '/AdvertiseAction';
	var jsonData = {"venue":selectedVenue, "venueCategory":advertiseChildCategory,"venueName":advertiseInputVenueName, "featureValues":featureValues, "skips":skips, "featureRanges":featureRanges };
	//console.log(jsonData);
	//console.log('REQUEST URL: %j', url);
	$.ajax(
		{
			type: 'POST',
			url: '/AdvertiseAction',
			data: jsonData,
			success: function (result) {
				//console.log('AdvertiseAction REQUEST RESULT: ', result);
				//Success message
				$("#scsMsgContent").text(result.message.text);
				$("#successMessage").show();
				//Reload player data on footer
				$("#userCash").text(formatCurrency(result.player.cash));
				$("#userNumVenues").text(result.player.numVenues);
			},
			error: function (req, status, error) {
				console.log('ERROR: ' + error);
				console.log('Unable to get AdvertiseAction response');
				$("#errorMessage").show();
			}
		});
	// Show message
	$("#messageModal").modal('show');
};

//Quiz button event
$("#quzBtn").click(function() {
	$("#occupiedModal").modal('hide');
	$("#quizModal").modal('show');
});

// Quiz Answer Button Event
$('#quizTabsContent').on( "click", "a.btn", function(event){
	//console.log(event.target.id + ' BUTTON CLICKED!');
	//console.log('VISIT QUIZ: ', visitQuiz);
	var optionSelected = [];
	switch(event.target.id) {
		case 'yesStp1':
			for(var i=0; i < 4; i++){
				if(i==0){
					optionSelected.push('true');
				}else{
					optionSelected.push('false');
				}
			}
			visitQuiz.selected.push(optionSelected);
			visitQuiz.skips.push('false');
			break;
		case 'noStp1':
			for(var i=0; i < 4; i++){
				if(i==1){
					optionSelected.push('true');
				}else{
					optionSelected.push('false');
				}
			}
			visitQuiz.selected.push(optionSelected);
			visitQuiz.skips.push('false');
			break;
		case 'idkStp1':
			for(var i=0; i < 4; i++){
				optionSelected.push('undefined');
			}
			visitQuiz.selected.push(optionSelected);
			visitQuiz.skips.push('true');
			break;
		case 'nextQzStp1':
			var index = $('input[name="optionsRadios"]:checked').val();
			//console.log('Options Selected: ', index);
			if (typeof index != 'undefined'){
				for(var i=0; i < visitQuiz.options[0].length; i++){
					if(i == index){
						optionSelected.push('true');
					}else{
						optionSelected.push('false');
					}
				}
				visitQuiz.skips.push('false');
			}else{
				for(var i=0; i < 4; i++){
					optionSelected.push('undefined');
				}
				visitQuiz.skips.push('true');
			}
			visitQuiz.selected.push(optionSelected);
			break;
		case 'yesStp2':
			for(var i=0; i < 4; i++){
				if(i==0){
					optionSelected.push('true');
				}else{
					optionSelected.push('false');
				}
			}
			visitQuiz.selected.push(optionSelected);
			visitQuiz.skips.push('false');
			break;
		case 'noStp2':
			for(var i=0; i < 4; i++){
				if(i==1){
					optionSelected.push('true');
				}else{
					optionSelected.push('false');
				}
			}
			visitQuiz.selected.push(optionSelected);
			visitQuiz.skips.push('false');
			break;
		case 'idkStp2':
			for(var i=0; i < 4; i++){
				optionSelected.push('undefined');
			}
			visitQuiz.selected.push(optionSelected);
			visitQuiz.skips.push('true');
			break;
		case 'nextQzStp2':
			var index = $('input[name="optionsRadios"]:checked').val();
			//console.log('Options Selected: ', index);
			if (typeof index != 'undefined'){
				for(var i=0; i < visitQuiz.options[1].length; i++){
					if(i == index){
						optionSelected.push('true');
					}else{
						optionSelected.push('false');
					}
				}
				visitQuiz.skips.push('false');
			}else{
				for(var i=0; i < 4; i++){
					optionSelected.push('undefined');
				}
				visitQuiz.skips.push('true');
			}
			visitQuiz.selected.push(optionSelected);
			break;
		case 'yesStp3':
			for(var i=0; i < 4; i++){
				if(i==0){
					optionSelected.push('true');
				}else{
					optionSelected.push('false');
				}
			}
			visitQuiz.selected.push(optionSelected);
			visitQuiz.skips.push('false');
			break;
		case 'noStp3':
			for(var i=0; i < 4; i++){
				if(i==1){
					optionSelected.push('true');
				}else{
					optionSelected.push('false');
				}
			}
			visitQuiz.selected.push(optionSelected);
			visitQuiz.skips.push('false');
			break;
		case 'idkStp3':
			for(var i=0; i < 4; i++){
				optionSelected.push('undefined');
			}
			visitQuiz.selected.push(optionSelected);
			visitQuiz.skips.push('true');
			break;
		case 'nextQzStp3':
			var index = $('input[name="optionsRadios"]:checked').val();
			//console.log('Options Selected: ', index);
			if (typeof index != 'undefined'){
				for(var i=0; i < visitQuiz.options[2].length; i++){
					if(i == index){
						optionSelected.push('true');
					}else{
						optionSelected.push('false');
					}
				}
				visitQuiz.skips.push('false');
			}else{
				for(var i=0; i < 4; i++){
					optionSelected.push('undefined');
				}
				visitQuiz.skips.push('true');
			}
			visitQuiz.selected.push(optionSelected);
			break;
		case 'yesStp4':
			for(var i=0; i < 4; i++){
				if(i==0){
					optionSelected.push('true');
				}else{
					optionSelected.push('false');
				}
			}
			visitQuiz.selected.push(optionSelected);
			visitQuiz.skips.push('false');
			break;
		case 'noStp4':
			for(var i=0; i < 4; i++){
				if(i==1){
					optionSelected.push('true');
				}else{
					optionSelected.push('false');
				}
			}
			visitQuiz.selected.push(optionSelected);
			visitQuiz.skips.push('false');
			break;
		case 'idkStp4':
			for(var i=0; i < 4; i++){
				optionSelected.push('undefined');
			}
			visitQuiz.selected.push(optionSelected);
			visitQuiz.skips.push('true');
			break;
		case 'nextQzStp4':
			var index = $('input[name="optionsRadios"]:checked').val();
			//console.log('Options Selected: ', index);
			if (typeof index != 'undefined'){
				for(var i=0; i < visitQuiz.options[3].length; i++){
					if(i == index){
						optionSelected.push('true');
					}else{
						optionSelected.push('false');
					}
				}
				visitQuiz.skips.push('false');
			}else{
				for(var i=0; i < 4; i++){
					optionSelected.push('undefined');
				}
				visitQuiz.skips.push('true');
			}
			visitQuiz.selected.push(optionSelected);
			break;
		case 'yesFinishQz':
			for(var i=0; i < 4; i++){
				if(i==0){
					optionSelected.push('true');
				}else{
					optionSelected.push('false');
				}
			}
			visitQuiz.selected.push(optionSelected);
			visitQuiz.skips.push('false');
			//console.log('QUIZ AFTER PLAY: ', visitQuiz);
			quiz(visitQuiz);
			break;
		case 'noFinishQz':
			for(var i=0; i < 4; i++){
				if(i==1){
					optionSelected.push('true');
				}else{
					optionSelected.push('false');
				}
			}
			visitQuiz.selected.push(optionSelected);
			visitQuiz.skips.push('false');
			//console.log('QUIZ AFTER PLAY: ', visitQuiz);
			quiz(visitQuiz);
			break;
		case 'idkFinishQz':
			for(var i=0; i < 4; i++){
				optionSelected.push('undefined');
			}
			visitQuiz.selected.push(optionSelected);
			visitQuiz.skips.push('true');
			//console.log('QUIZ AFTER PLAY: ', visitQuiz);
			quiz(visitQuiz);
			break;
		case 'finishQz':
			var index = $('input[name="optionsRadios"]:checked').val();
			//console.log('Options Selected: ', index);
			if (typeof index != 'undefined'){
				for(var i=0; i < visitQuiz.options[visitQuiz.skips.length].length; i++){
					if(i == index){
						optionSelected.push('true');
					}else{
						optionSelected.push('false');
					}
				}
				visitQuiz.skips.push('false');
			}else{
				for(var i=0; i < 4; i++){
					optionSelected.push('undefined');
				}
				visitQuiz.skips.push('true');
			}
			visitQuiz.selected.push(optionSelected);
			//console.log('QUIZ AFTER PLAY: ', visitQuiz);
			quiz(visitQuiz);
			break;
		default:
			//do nothing
			break;
	}
	$('.nav-tabs > .active').next('li').find('a').trigger('click');
});

function quiz(visit){
	//console.log('START QUIZ...');
	var selected = visit.selected;
	var skips = visit.skips;
	// Request to QuizAction
	var url = '/QuizAction';
	var jsonData = {"venue":selectedVenue, "selected":selected, "skips": skips };
	//console.log(jsonData);
	//console.log('REQUEST URL: %j', url);
	$.ajax(
		{
			type: 'POST',
			url: '/QuizAction',
			data: jsonData,
			success: function (result) {
				//console.log('QuizAction REQUEST RESULT: %j', result);
				//Success message
				$("#scsMsgContent").text(result.message.text);
				$("#successMessage").show();
				//Reload player data on footer
				$("#userCash").text(formatCurrency(result.player.cash));
				$("#userNumVenues").text(result.player.numVenues);
			},
			error: function (req, status, error) {
				console.log('ERROR: ' + error);
				console.log('Unable to get QuizAction response');
				$("#errorMessage").show();
			}
		});
	// Show message
	$("#messageModal").modal('show');
};

//Skip button event
$("#skpBtn").click(function() {
	//console.log('SKIP CLICKED');
	$("#occupiedModal").modal('hide');
	$("#skipModal").modal('show');
	// Request to SkipAction
	var url = '/SkipAction';
	var jsonData = { "venue":selectedVenue };
	//console.log(jsonData);
	//console.log('REQUEST URL: ', url);
    $.ajax(
		{
            type: 'POST',
            url: '/SkipAction',
            data: jsonData,
            success: function (result) {
				//console.log('SkipAction REQUEST RESULT: %j', result);
				//Success message
				$("#scsMsgContent").text(result.message.text);
				$("#successMessage").show();
				//Reload player data on footer
				$("#userCash").text(formatCurrency(result.player.cash));
				$("#userNumVenues").text(result.player.numVenues);
            },
            error: function (req, status, error) {
				console.log('ERROR: ' + error);
				console.log('Unable to get SkipAction response');
				$("#errorMessage").show();
            }
        });
    // Close modal and show message
	$("#occupiedModal").modal('hide');
	$("#messageModal").modal('show');
});

// Ok message modal event
$("#okMsgModal").click(function() {
	//Reload updated map
	requestUpdatedMap(lat, lon);
});

// Yes message modal event used to share on facebook
$("#yesMsgModal").click(function() {
	//console.log('SHARE ON FB CLICKED');
	// Request to Share
	var url = '/Share';
	//console.log('REQUEST URL: ', url);
	$.ajax(
		{
            type: 'POST',
            url: '/Share',
            success: function (result) {
				//console.log('SHARE REQUEST RESULT: ', result);
            },
            error: function (req, status, error) {
				console.log('ERROR: ' + error);
				console.log('Unable to get Share response');
            }
        });
	//Reload updated map
	requestUpdatedMap(lat, lon);
});

// No message modal event
$("#noMsgModal").click(function() {
	//Reload updated map
	requestUpdatedMap(lat, lon);
});

function formatCurrency(n, currency) {
    if(typeof currency != 'undefined'){
        return currency + " " + n.toFixed().replace(/./g, function(c, i, a) {
            return i > 0 && c !== "." && (a.length - i) % 3 === 0 ? "." + c : c;
        });
    }else{
        return n.toFixed().replace(/./g, function(c, i, a) {
            return i > 0 && c !== "." && (a.length - i) % 3 === 0 ? "." + c : c;
        });        
    }
}