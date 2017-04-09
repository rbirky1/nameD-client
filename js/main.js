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

    /* Example data */
    /*
        index, name, rank, count, prop100k, cum_prop100k, pctwhite, pctblack, pctapi, pctaian, pct2prace, pcthispanic
        [[30079,"BIRKY",30076,780,0.26,78844.16,"93.46","0.9","1.03","0.9","1.92","1.79"]]
    */
    //var res = [[30079,"BIRKY",30076,780,0.26,78844.16,"93.46","0.9","1.03","0.9","1.92","1.79"]];
    //var res = [[30079,"BIRKY",30076,780,0.26,78844.16,"93.46","0.9","1.03","0.9","1.92","(s)"]];

    $.get("data/example_response.json", function(data){
        // Fade out spinner
        $spinner.fadeOut(1000);

        var row = data[0];
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

//    $.post( "url", data, function(res) {
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