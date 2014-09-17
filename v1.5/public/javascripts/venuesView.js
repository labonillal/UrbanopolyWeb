//
// UrbanopolyWeb v1.5.0
// 
// Copyright (c) 2012-2014, CEFRIEL
// Licensed under the Apache 2.0 License.
//

var selectedVenue;

$('table tr').click(function(event) {
    // Get id of the clicked venue
    //console.log('Row clicked!: ' + $(event.target).closest('tr').data('id'));
    $('#judgePanel').hide();
    var venueId = $(event.target).closest('tr').data('id');
    //Default setup
    $("#posterDetails").empty();
    $("#buyBtn").hide();
	$("#mtgBtn").hide();
	$("#rdmBtn").hide();
	$("#selBtn").hide();
	$("#successMessage").hide();
	$("#errorMessage").hide();
    // Request to get rent info
	$.ajax(
		{
			type: 'GET',
			url: '/retrieveVenueDetails?venueId=' + venueId,
			success: function (venueDetails) {
				//console.log('VENUE DETAILS JSON: ', JSON.stringify(venueDetails));
				if(venueDetails.length != 0){
					selectedVenue = JSON.stringify(venueDetails);
					//console.log('venueDetails: ', venueDetails);
					$("#venueName").text(venueDetails.name);
					$("#venueIcon").attr("src", venueDetails.icon.iconUrl);
					$("#venueCategory").text(venueDetails.category.name + " (" + venueDetails.category.parent + ")");
					$("#venueValue").text(formatCurrency(venueDetails.value, "€"));
					$("#venueRent").text(formatCurrency(venueDetails.rent, "€"));
					// If the venue has posters to judge
					if(venueDetails.posters.length != 0){
						//console.log('Number of posters: ', venueDetails.posters.length);
						$("#numPosters").text('You have '+ venueDetails.posters.length +' poster to judge!');
						$('#judgePanel').show();
						var poster = venueDetails.posters[0];
						// Adds the picture thumbnail if its available
						if(poster.idPhoto != null){
							$("#photo").attr("src", poster.idPhoto);
							$("#photo").attr("title", poster.venueName);
						}
						// Adds VenueName and Category to the poster
						var posterDetails = 	'<h4>'+ poster.venueName +'</h4>';
							posterDetails +=	'<h5>'+ venueDetails.category.name + ' (' + venueDetails.category.parent + ')</h5>';
						$(posterDetails).appendTo('#posterDetails');
						// Adds each feature to the poster 
						for(var i in poster.featureTypes){
							if(poster.featureValues[i] != null){
								var posterDetails = '<h5>' + poster.featureTypes[i].name + ' : ' + poster.featureValues[i] +'</h5>';
								$(posterDetails).appendTo('#posterDetails'); 
							}
						}
					}
					// Enable sell button
    				$("#selBtn").show();
					if(venueDetails.state == 'MINE'){
						// Enable mortgage button
    					$("#mtgBtn").show();
					}else if (venueDetails.state == 'MINE_MORTGAGED'){
						// Enable redeem button
    					$("#rdmBtn").show();
					}
				}else{
					$("#venueRent").text("Unknown Rent");
				}
			},
			error: function (req, status, error) {
				//console.log('ERROR: ' + error);
				console.log('Unable to get retrieveVenueRent response');
			}
		});
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
				if(result.visit == null){
					//Error message
					$("#errMsgContent").text(result.message.text);
					$("#errorMessage").show();
				}else{
					//Success message
					$("#scsMsgContent").text(result.message.text);
					$("#successMessage").show();
				}
				//Reload player data on footer
				$("#userCash").text(result.player.cash);
				$("#userNumVenues").text(result.player.numVenues);
            },
            error: function (req, status, error) {
				//console.log('ERROR: ' + error);
				console.log('Unable to get SellAction response');
				$("#errorMessage").show();
            }
        });
    // Close modal and show message
	$("#venueModal").modal('hide');
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
				if(result.visit == null){
					//Error message
					$("#errMsgContent").text(result.message.text);
					$("#errorMessage").show();
				}else{
					//Success message
					$("#scsMsgContent").text(result.message.text);
					$("#successMessage").show();
				}
				//Reload player data on footer
				$("#userCash").text(result.player.cash);
				$("#userNumVenues").text(result.player.numVenues);
            },
            error: function (req, status, error) {
				//console.log('ERROR: ' + error);
				console.log('Unable to get MortgageAction response');
				$("#errorMessage").show();
            }
        });
    // Close modal and show message
	$("#venueModal").modal('hide');
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
				if(result.visit == null){
					//Error message
					$("#errMsgContent").text(result.message.text);
					$("#errorMessage").show();
				}else{
					//Success message
					$("#scsMsgContent").text(result.message.text);
					$("#successMessage").show();
				}
				//Reload player data on footer
				$("#userCash").text(result.player.cash);
				$("#userNumVenues").text(result.player.numVenues);
            },
            error: function (req, status, error) {
				//console.log('ERROR: ' + error);
				console.log('Unable to get RedeemAction response');
				$("#errorMessage").show();
            }
        });
    // Close modal and show message
	$("#venueModal").modal('hide');
	$("#messageModal").modal('show');
});

// Judge panel event
$("#judgePanel").click(function() {
	$("#venueModal").modal('hide');
	$("#posterModal").modal('show');
});
// Rating event
$('#rating').on('rating.change', function(e, value) {
    var venue = JSON.parse(selectedVenue);
    venue.posters[0].photoRank = parseFloat(value);
    selectedVenue = JSON.stringify(venue);
});
// Rating clear event
$('#rating').on('rating.clear', function(event) {
    
});

// Ok poster modal event
$("#okPosterBtn").click(function() {
	// Request to JudgeAction
	var url = '/JudgeAction';
	var jsonData = { "venue":selectedVenue };
	//console.log('JSON DATA: ', jsonData);
	//console.log('REQUEST URL: ', url);
    $.ajax(
		{
            type: 'POST',
            url: '/JudgeAction',
            data: jsonData,
            success: function (result) {
				//console.log('JudgeAction REQUEST RESULT: %j', result);
				if(result.visit == null){
					//Error message
					$("#errMsgContent").text(result.message.text);
					$("#errorMessage").show();
				}else{
					//Success message
					$("#scsMsgContent").text(result.message.text);
					$("#successMessage").show();
				}
				//Reload player data on footer
				$("#userCash").text(formatCurrency(result.player.cash));
				$("#userNumVenues").text(result.player.numVenues);
            },
            error: function (req, status, error) {
				//console.log('ERROR: ' + error);
				console.log('Unable to get JudgeAction response');
				$("#errorMessage").show();
            }
        });
    // Close modal and show message
	$("#posterModal").modal('hide');
	$("#messageModal").modal('show');
});

// Report Abuse poster modal event
$("#reportAbusePosterBtn").click(function() {
	// Request to JudgeAction
	var url = '/JudgeAction';
	var venue = JSON.parse(selectedVenue);
	venue.posters[0].offensive = true;
	selectedVenue = JSON.stringify(venue);
	var jsonData = { "venue":selectedVenue };
	//console.log('JSON DATA: ', jsonData);
	//console.log('REQUEST URL: ', url);
    $.ajax(
		{
            type: 'POST',
            url: '/JudgeAction',
            data: jsonData,
            success: function (result) {
				//console.log('JudgeAction REQUEST RESULT: %j', result);
				if(result.visit == null){
					//Error message
					$("#errMsgContent").text(result.message.text);
					$("#errorMessage").show();
				}else{
					//Success message
					$("#scsMsgContent").text(result.message.text);
					$("#successMessage").show();
				}
				//Reload player data on footer
				$("#userCash").text(formatCurrency(result.player.cash));
				$("#userNumVenues").text(result.player.numVenues);
            },
            error: function (req, status, error) {
				//console.log('ERROR: ' + error);
				console.log('Unable to get JudgeAction response');
				$("#errorMessage").show();
            }
        });
    // Close modal and show message
	$("#posterModal").modal('hide');
	$("#messageModal").modal('show');
});

// Ok message modal event
$("#okMsgModal").click(function() {
	//Reload venues table
	//console.log('OK button clicked!');
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