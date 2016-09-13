let EmailDataExample = (viewLimit) => {

	document.getElementById("ExampleData").innerHTML="";

	d3.text("emailData.csv", function(data) {
	    
	    let initalParse = d3.csvParseRows(data);

	    if ( viewLimit < 0 || viewLimit > initalParse.length ) {
			viewLimit = initalParse.length;
	    }

	    let parsedCSV = initalParse.slice(0, viewLimit);
	    let container = d3.select("#ExampleData")

	        .selectAll("tr")
	            .data(parsedCSV).enter()
	            .append("tr")

	        .selectAll("td")
	            .data(function(d) { return d; }).enter()
	            .append("td")
	            .text(function(d) { return d; });
	});
};
