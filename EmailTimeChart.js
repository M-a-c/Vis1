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


let findTimeAsZone = (time) => {
    var roundedTime = round(time,0);

    if(roundedTime>12){
        roundedTime=roundedTime%12;
        return String(roundedTime) + "PM";
    }
    else{
        return String(roundedTime) + "AM";
    }
    
}

//Credit to Billy Moon - Sep 8 '11 at 4:06
//His code was quicker than what I could come up with so this function is verbatim not mine
//http://stackoverflow.com/questions/7342957/how-do-you-round-to-1-decimal-place-in-javascript
let round = (value, precision) => {
    var multiplier = Math.pow(10, precision || 0);
    return Math.round(value * multiplier) / multiplier;
}


let EmailTimeChart = () => {

    var formatTime = d3.timeFormat("%B %d");
    var uniqueDates = [];
    var allRows =[];
    var data = []


    d3.text("emailData.csv", (emailData) => {
        
        //All Data cleaning and parsing.
        allRows = d3.csvParseRows(emailData)
            .slice(1, d3.csvParseRows(emailData).lenght);

        let dates = allRows.map((emailData) => {return formatTime(new Date(emailData[0]));});
        uniqueDates = Array.from(new Set(dates));
        let times = allRows.map((emailData) => {return findHourTime(emailData[1]);});

        d = uniqueDates.map((uniqueDate) => {
            var count = 0;
            var totalTime = 0;
            var color = [0,0,0];
            var typeOfEmail = [0,0,0,0];

            allRows.map((emailData) => { 
                if (formatTime(new Date(emailData[0])) == uniqueDate) {
                    count++;
                }
            });

            allRows.map((emailData) => { 
                if (formatTime(new Date(emailData[0])) == uniqueDate) {
                    totalTime += findHourTime(emailData[1]);
                }
            });

            allRows.map((emailData) => { 
                if (formatTime(new Date(emailData[0])) == uniqueDate) {
                    if(emailData[5]==="answer"){
                        color[0]+=0;
                        color[1]+=255;//green
                        color[2]+=0;
                        typeOfEmail[0]+=1;
                    }
                    else if(emailData[5]==="statement"){
                        color[0]+=0;
                        color[1]+=0;
                        color[2]+=255;//blue
                        typeOfEmail[1]+=1;
                    } 
                    else if(emailData[5]==="question"){
                        color[0]+=255;//red
                        color[1]+=0;
                        color[2]+=0;
                        typeOfEmail[2]+=1;
                    }
                    else{
                        color[0]+=0;
                        color[1]+=0;
                        color[2]+=0;
                        typeOfEmail[3]+=1;
                    }
                }
            });

            color[0]/=count;
            color[1]/=count;
            color[2]/=count;

            totalTime = totalTime/count;

            var returnVariable = [uniqueDate,totalTime,count,color,typeOfEmail];
            return returnVariable;

        });

        data = d;
        d = data;


        var tooltip = d3.select("body")
            .append("div")
            .style("position", "absolute")
            .style("z-index", "10")
            .style("background-color","white")
            .style("padding","10px")
            .style("border-radius", "25px")
            .style("visibility", "hidden")
            .text("a simple tooltip");

        uniqueDates.push(" ");
        uniqueDates.unshift(0);

        let margin = {top: 50, right: 50, bottom: 150, left: 50};
        let width = 960 - margin.left - margin.right;
        let height = 500 - margin.top - margin.bottom;
        
        let x = d3.scalePoint()
                .domain(uniqueDates)
                .range([ 0, width ]);
        
        let y = d3.scaleLinear()
                .domain([0, d3.max(data, (d) => {
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
            


        // all x axis code
        let xAxis = d3.axisBottom()
            .scale(x);

        EmailGraph.append('g')
            .attr('transform', 'translate(0,' + height + ')')
            .attr('class', 'EmailGraph axis date')
            .call(xAxis)

            .selectAll("text")
                .attr("y", 0)
                .attr("x", 9)
                .attr("dy", ".35em")
                .attr("transform", "rotate(90)")
                .style("text-anchor", "start");

        EmailGraph.append("text")
            .attr("class", "x label")
            .attr("text-anchor", "end")
            .attr("x", width)
            .attr("y", height + 30)
            .text("Date");



        // all y axis code
        let yAxis = d3.axisLeft()
            .scale(y)
            .ticks(12);

        EmailGraph.append('g')
            .attr('transform', 'translate(0,0)')
            .attr('class', 'EmailGraph axis date')
            .call(yAxis);

        EmailGraph.append("text")
            .attr("class", "y label")
            .attr("text-anchor", "end")
            .attr("transform", "rotate(-90)")
            .attr("x", 0)
            .attr("y", -30)
            .text("Time of Day");



        //All displayed data code
        let g = EmailGraph.append("g"); 
        
        g.selectAll("scatter-dots")
            .data(data)
            .enter().append("circle")
                .attr("cx", (d,i) => { return x(d[0]); } )
                .attr("cy", (d) => { return y(d[1]); } )
                .attr("r",  (d) => { return d[2]; } )
                .attr('fill', (d) => {return d3.rgb(d[3][0], d[3][1], d[3][2]);})   

                .on("mouseover", (d) => {return tooltip.style("visibility", "visible")
                                                .html(`<p>Number of Emails: ${d[2]}</p>
                                                       <p>Average time of email: ${findTimeAsZone(d[1])}</p>
                                                       <p style="color:green;">answers: ${d[4][0]} (${round((d[4][0]/d[2])*100,1)}%)</p>
                                                       <p style="color:blue;">statements: ${d[4][1]} (${round((d[4][1]/d[2])*100,1)}%)</p>
                                                       <p style="color:red;">questions: ${d[4][2]} (${round((d[4][2]/d[2])*100,1)}%)</p>
                                                       <p style="color:black;">other: ${d[4][3]} (${round((d[4][3]/d[2])*100,1)}%)</p>`);
                                        })

                .on("mousemove", (d) => {return tooltip.style("top", (d3.event.pageY-10)+"px")
                                                       .style("left",(d3.event.pageX+10)+"px");
                                        })

                .on("mouseout", () =>  {return tooltip.style("visibility", "hidden");});


    });

};
