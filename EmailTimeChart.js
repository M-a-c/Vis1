var d;

let findHourTime = (time) => {
    time = String(time);
    var matches = time.match(/(\d+):(\d+)/);
    
    var hourTime = 0;
    hourTime += parseInt(matches[0],10); 
    
    var timeMinuite = parseInt(matches[1],10);
    hourTime +=  timeMinuite/60;
    
    if(time.toLowerCase().includes("pm")){
        hourTime += 12;
    }
    return hourTime;
};

let EmailTimeChart = () => {
    var data = []

    d3.text("emailData.csv", function(emailData) {
        
        let allRows = d3.csvParseRows(emailData)
            .slice(1, d3.csvParseRows(emailData).lenght);

        let dates = allRows.map((emailData) => {return emailData[0];});
        console.log(dates);
        let uniqueDates = Array.from(new Set(dates));
        console.log(uniqueDates);
        
        let times = allRows.map((emailData) => {return findHourTime(emailData[1]);});
        console.log(times);

        let d = uniqueDates.map((uniqueDate) => {
            var count = 0;
            var totalTime = 0;
                allRows.map((emailData) => { 
                    if (emailData[0] == uniqueDate) {
                        count++;
                    }
                });
                console.log(count);
                allRows.map((emailData) => { 
                    if (emailData[0] == uniqueDate) {
                        totalTime += findHourTime(emailData[1]);
                    }
                });

                totalTime = totalTime/count;
                console.log(totalTime);
                var returnVariable = [uniqueDate,totalTime,count];
                return returnVariable;

        });


        d = allRows;
    });


//https://github.com/d3/d3-scale#scaleTime

     data = [[5,3,22], [10,17,4], [15,4,5], [2,8,8]];

        let margin = {top: 50, right: 50, bottom: 50, left: 50}
      , width = 960 - margin.left - margin.right
      , height = 500 - margin.top - margin.bottom;
    
    let x = d3.scaleLinear()
            .domain([0, d3.max(data, function(d) { return d[0]; })])
            .range([ 0, width ]);
    
    let y = d3.scaleLinear()
            .domain([0, d3.max(data, function (d) {
                return 24;
            })])
            .range([height, 0]);
 


    let chart = d3.select('#EmailTimeChart')
        .append('svg')
        .attr('preserveAspectRatio',"xMidYMid meet")
        .attr('viewBox',`${0} ${0} ${width + margin.right + margin.left} ${height + margin.top + margin.bottom}`)
        .attr('class', 'chart')

    let EmailGraph = chart.append('g')
        .attr('transform', 'translate(' + margin.left + ',' + margin.top + ')')
        .attr('width', width)
        .attr('height', height)
        .attr('class', 'EmailGraph')   
        


    // draw the x axis
    let xAxis = d3.axisBottom()
        .scale(x);

    EmailGraph.append('g')
        .attr('transform', 'translate(0,' + height + ')')
        .attr('class', 'EmailGraph axis date')
        .call(xAxis);



    // draw the y axis
    let yAxis = d3.axisLeft()
        .scale(y)
        .ticks(12);

    EmailGraph.append('g')
        .attr('transform', 'translate(0,0)')
        .attr('class', 'EmailGraph axis date')
        .call(yAxis);



    let g = EmailGraph.append("g"); 
    
    g.selectAll("scatter-dots")
        .data(data)
        .enter().append("circle")
            .attr("cx", function (d,i) { return x(d[0]); } )
            .attr("cy", function (d) { return y(d[1]); } )
            .attr("r",  function (d) { return d[2]; } )

             // Add the points!
    g.selectAll(".point")
        .data(data)
    .enter().append("triangle-up")
        .attr("class", "point")
        .attr("transform", function(d) { return "translate(" + x(d[0]) + "," + y(d[1]) + ")"; });

};