/* Variables */
// Get surname input field
var $surnameInput = $("#surname-input");
// Get surname search button
var $searchBtn = $("#surname-search-btn");
// Get spinner
var $spinner = $("#loading-spinner");
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
            search_for_surname();
        }
    });
    // On surname-search-btn click
    $searchBtn.click(function(e) {
        search_for_surname();
    })

});

function search_for_surname(surname) {

    // Scroll to results
    $('html, body').stop().animate({
        scrollTop: $("#graphs").offset().top
    }, 1000);

    // Fade in spinner
    $spinner.fadeIn(2000);

    // Data to send
    var data = { name: $surnameInput.val() };

    var stats_url = 'http://'+ip+":"+port+"/"+stats;
    $.get(stats_url, function(data){
        // Fade out spinner
        $spinner.fadeOut(1000);

        console.log(data.census[0]);
        var row = data.census[0];
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

        console.log(cols);
    });

//    $.post( "/get_stats", data, function(res) {
//        console.log(res);
//    })
//    .fail(function() {
//        console.log( "error" );
//    })
//    .always(function() {
//        // Remove or fade out spinner
//        $spinner.fadeOut("fast");
//    });

};