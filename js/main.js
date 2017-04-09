/* Variables */
// Get surname input field
var $surnameInput = $("#surname-input");
// Get surname search button
var $searchBtn = $("#surname-search-btn");
var $chartContainer = $("#chart-container");
var $searchAgain = $("#search-again-btn");
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
var names = 'get_names';
var asianMapping = {
    'C':'Chinese',
    'R':'Filipino',
    'J':'Japanese',
    'V':'Vietnamese',
    'K':'Korean',
    'I':'Indian'
}

$(function() {

    /* Initialization */
    // Get list of names in database for field autocomplete
    var names_url = 'http://'+ip+":"+port+"/"+names;

    $.ajax({
       url: names_url,
       success: function(data){
            $surnameInput.typeahead({ source: data.names });
            $surnameInput.attr("disabled",false).focus();
       },
       error: function(x, t, m) {
           $('#modal-text').text('Sorry, it appears the server is offline. Please try again later.');
           $('#error-modal').modal('show');
       },
       timeout: 5000
    });

    /* Event handlers */
    // On surname-input enter key down
    $surnameInput.keypress(function(e) {
        if (e.which == "13") {
            if ($surnameInput.val() !== ""){
                search_for_surname($surnameInput.val());
            }
        }
    });
    // On surname-search-btn click
    $searchBtn.click(function(e) {
        if ($surnameInput.val() !== ""){
            search_for_surname($surnameInput.val());
        }
    });
	$surnameInput.keyup(function(e) {
		if ($surnameInput.val() === ""){
			$searchBtn.addClass("disabled");
		} else {
			$searchBtn.removeClass("disabled");
		}
	});
	$searchAgain.click(function(e) {
	    $("#result-container").fadeOut(1000);
	    $('html, body').stop().animate({
            scrollTop: $("#banner").offset().top
        }, 1000);
        $surnameInput.focus();
	});
});

function search_for_surname(surname) {

    // Data to send
    var req = $surnameInput.val();

    var stats_url = 'http://'+ip+":"+port+"/"+stats;
    $.post( stats_url, req, function(data) {

        $("#result-container").fadeIn();
        $("#surname-label").text(surname);
        $("#again").fadeIn();

        // Scroll to results
        $('html, body').stop().animate({
            scrollTop: $("#result-container").offset().top
        }, 1000);
		
		var json = JSON.parse(data.census);
		var row = json[0];
		
		if (!row || row.length == 0) {

			$("#surname-no-data").text(surname);
			$chartContainer.fadeOut(100);
			$("#no-data").fadeIn();

		} else {

			$("#no-data").fadeOut();
			$chartContainer.fadeIn(1000);
			var percents = row.slice(6,12);

			var cols = [];
			var total = row[3];
			$("#total").text(total);
			var accounted = 0;

			if (data.asian && JSON.parse(data.asian).length > 0) {
                var asianJson = JSON.parse(data.asian);
                var asianKey = asianJson[0][2];
                var asianValue = asianMapping[asianKey];
            }

			for (var i=0; i<percents.length; i++){
				if (parseFloat(percents[i])) {
					var percent = parseFloat(percents[i]);
					var number = total*(percent/100.0);
					var type = mapping[i];

					if (i==2 && asianValue) {
					    type+=" (";
					    type+=asianValue;
					    type+=")";
					}

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
        $('#modal-text').text('Sorry, there has been an error. Please try again.');
        $('#error-modal').modal('show');
    });

};