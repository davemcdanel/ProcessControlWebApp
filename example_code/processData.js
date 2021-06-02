Read a CSV file and convert to an array.  Found this at https://stackoverflow.com/questions/7431268/how-to-read-data-from-csv-file-using-javascript/12289296#12289296


The following code will work on a "true" CSV file with linebreaks between each set of records:

data.txt:

heading1,heading2,heading3,heading4,heading5
value1_1,value2_1,value3_1,value4_1,value5_1
value1_2,value2_2,value3_2,value4_2,value5_2

javascript:

$(document).ready(function() {
    $.ajax({
        type: "GET",
        url: "data.txt",
        dataType: "text",
        success: function(data) {processData(data);}
     });
});

function processData(allText) {
    var allTextLines = allText.split(/\r\n|\n/);
    var headers = allTextLines[0].split(',');
    var lines = [];

    for (var i=1; i<allTextLines.length; i++) {
        var data = allTextLines[i].split(',');
        if (data.length == headers.length) {

            var tarr = [];
            for (var j=0; j<headers.length; j++) {
                tarr.push(headers[j]+":"+data[j]);
            }
            lines.push(tarr);
        }
    }
    // alert(lines);
}
