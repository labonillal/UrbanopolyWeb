var selectedVenue;

$('table tr').click(function(event) {
    // Get id of the clicked venue
    //console.log('Row clicked!: ' + $(event.target).closest('tr').data('id'));
    var venueId = $(event.target).closest('tr').data('id');
    //Default setup
    $("#buyBtn").hide();
	$("#mtgBtn").hide();
	$("#rdmBtn").hide();
	$("#selBtn").hide();
	$("#okMsgModal").hide();
	$("#yesMsgModal").hide();
	$("#noMsgModal").hide();
    // Request to get rent info
	$.ajax(
		{
			type: 'GET',
			url: '/retrieveVenueDetails?venueId=' + venueId,
			success: function (venueDetails) {
				//console.log('VENUE DETAILS JSON: ', JSON.stringify(venueDetails));
				if(venueDetails.length != 0){
					selectedVenue = JSON.stringify(venueDetails);
					$("#venueName").text(venueDetails.name);
					$("#venueIcon").attr("src", venueDetails.icon.iconUrl);
					$("#venueCategory").text(venueDetails.category.name + " (" + venueDetails.category.parent + ")");
					$("#venueValue").text(formatCurrency(venueDetails.value, "€"));
					$("#venueRent").text(formatCurrency(venueDetails.rent, "€"));
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
				console.log('ERROR: ' + error);
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

// Ok message modal event
$("#okMsgModal").click(function() {
	//Reload venues table
	//console.log('OK button clicked!');
});

// No message modal event
$("#noMsgModal").click(function() {
	//Reload venues table
	//console.log('NO button clicked!');
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