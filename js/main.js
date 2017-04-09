/* Variables */
// Get surname input field
var $surnameInput = $("#surname-input");
// Get surname search button
var $searchBtn = $("#surname-search-btn");
// Get spinner
var $spinner = $("#loading-spinner");
var $chartContainer = $("#chart-container");
// Map indices to field names T_T
var mapping = [
    "White",
    "Black",
    "Asian and Pacific Islander",
    "American Indian and Alaskan Native",
    "Two or More Races",
    "Hispanic or Latino"
];
var ip = '127.0.0.1';
var port = 5000;
var stats = 'get_stats';

$(function() {

    /* Initialization */
    // Get list of names in database for field autocomplete
    $.get("data/example_collection.json", function(data){
        $surnameInput.typeahead({ source: data });
    });

    /* Event handlers */
    // On surname-input enter key down
    $surnameInput.keypress(function(e) {
        if (e.which == "13") {
            search_for_surname($surnameInput.val());
        }
    });
    // On surname-search-btn click
    $searchBtn.click(function(e) {
        search_for_surname($surnameInput.val());
    })
	$surnameInput.keyup(function(e){
		if ($surnameInput.val() === ""){
			$searchBtn.addClass("disabled");
		} else {
			$searchBtn.removeClass("disabled");
		}
	})

});

function search_for_surname(surname) {
	
	$("#surname-label").text(surname);
	

    // Scroll to results
    $('html, body').stop().animate({
        scrollTop: $("#graphs").offset().top
    }, 1000);

    // Fade in spinner
    //$spinner.fadeIn(2000);

    // Data to send
    var req = $surnameInput.val();

    var stats_url = 'http://'+ip+":"+port+"/"+stats;
//    $.get(stats_url, function(data){
    $.post( stats_url, req, function(data) {
		// Remove or fade out spinner
        //$spinner.fadeOut(1000);
		
		var json = JSON.parse(data.census);
		var row = json[0];
		
		if (!row || row.length == 0) {
			console.log('no data');
			$("#surname-no-data").text(surname);
			$chartContainer.fadeOut(100);
			$("#no-data").fadeIn();
		} else {
		
			$("#no-data").fadeOut();
			$chartContainer.fadeIn(1000);
			var percents = row.slice(6,12);

			var cols = [];
			var total = row[3];
			var accounted = 0;

			for (var i=0; i<percents.length; i++){
				if (parseFloat(percents[i])) {
					var percent = parseFloat(percents[i]);
					var number = total*(percent/100.0);
					var type = mapping[i];
					cols.push([type, number]);
					// Add to accounted
					accounted += percent;
				}
			}

			// if accounted != total make dummy (S)
			if (accounted.toPrecision(3) != 100) {
				cols.push(["Unknown", total*((100-accounted)/100.0)]);
			}

			var chart = c3.generate({
				data: {
					bindto: '#chart',
					type : 'pie',
					columns: cols
				}
			});
        
		}
		
    })
    .fail(function() {
        console.log( "error" );
    })
    .always(function() {
        // Remove or fade out spinner
        $spinner.fadeOut(1000);
    });

};