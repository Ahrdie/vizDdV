var dataContent;

d3.text("https://gist.githubusercontent.com/Ahrdie/f9283466f24b6c29015350dfd84188f0/raw/5108d00b7f6325c594f7e62fe6439b96b8a2cbc4/data.csv").then(function(text){
    dataContent = text;
    drawData();
});

// https://github.com/wbkd/d3-extended
d3.selection.prototype.moveToFront = function() {  
  return this.each(function(){
    this.parentNode.appendChild(this);
  });
};

function drawData(){
  d3.json("https://unpkg.com/d3-time-format@2/locale/de-DE.json").then(function(locale) {
    d3.timeFormatDefaultLocale(locale);                   // setting german as language for timestamps

    var ssv = d3.dsvFormat(";");                          // ssv := semicolon seperated values
    var parseBirthday =     d3.timeParse("%d.%m.%Y");
    var parseSlashDate = d3.timeParse("%m/%d/%y");
    var parseMailSendTime = d3.timeParse("%d-%B-%Y-%H:%M");
    var parseReceiveDate = d3.timeParse("%m/%d/%y-%H:%M");
    var parseReceiveDateFullYear = d3.timeParse("%m/%d/%Y-%H:%M");

    var formatReadableDate = d3.timeFormat("%d.%m.")

    function parseSendDate(letter, mailSendDate, sendTime, letterSendDate){
      if(letter == 0) {
        return parseMailSendTime(mailSendDate + "-2018-" + sendTime);

      } else if (letter == 1) {
        return parseSlashDate(letterSendDate);

      } else {
        return null
      }
    }

    function parse01AsBool(binaryToParse){
      if (binaryToParse == 1){
        return true;
      } else if( binaryToParse == 0){
        return false;
      } else {
        return null;
      }
    }

    function parseDate1(date, time){
      if (time == "" && date != ""){
        return parseSlashDate(date)
      } else if (time != ""){
        return parseReceiveDate(date + "-" + time.replace("-",":"))
      } else{
        return null
      }
    }

    function parseDate2(date, time){
      var parsedDate = parseReceiveDateFullYear(date + "-" + time);
      if (parsedDate == null){
        return parseMailSendTime(date + "-2018-" + time);
      } else {
        return parsedDate
      }
    }

    function getAllDates(mdbData){
      var dates = [];

      function addToDatesIfLegal(dateToAdd){
        if(dateToAdd != null){
          dates.push(dateToAdd);
        }
      }

      for(var mdb in mdbData){
        addToDatesIfLegal(mdbData[mdb].send);
        addToDatesIfLegal(mdbData[mdb].firstInteractionDate);
        addToDatesIfLegal(mdbData[mdb].secondInteractionDate);
      }
      return dates;
    }

    function parseFinal(mdbFinal){
      if(mdbFinal.includes("1")){
        return true;
      } else {
        return false;
      }
    }

    var data = ssv.parse(dataContent, function(d){
      return{
        id:                     +d.identification,
        firstname:              d.vorname,
        surname:                d.Nachname_zusammen,
        birthday:               parseBirthday(d.gebdatum),
        fraction:               d.fraktion,
        party:                  d.partei,
        religion:               d.religion,
        randomGroup:            +d.randomisierungsgruppe,
        letter:                 parse01AsBool(+d.Brief),
        lengthOfCommunication:  +d.LenKom,
        migBackgroundUsed:      parse01AsBool(+d.migh),
        send:                   parseSendDate(+d.Brief, d.EigenesSendedatum, d.EigeneSendezeit, d.Versand1_imputiert),
        firstInteractionDate:   parseDate1(d.Datum1, d.Zeit1),
        secondInteractionDate:  parseDate2(d.Datum2, d.Zeit2),
        final:                  parseFinal(d.Abschließend1)
      };
    });

    var margin = {left:100,right:50,top:120,bottom:200}
    var height = 500;
    var width = 960 - margin.left - margin.right;
    
    var allDates = getAllDates(data);
    var timeRange = d3.extent(allDates);
    var maxComLength = d3.max(data, function(d){return Math.abs(d.lengthOfCommunication)})

    var y = d3.scaleLog()
      .domain([100,maxComLength ])  // TODO: min Value is manually set to 100. Has to be changed to a function/Variable
      .range([height,0]);

    var x = d3.scaleTime()
      .domain(timeRange)
      .range([0,width]);

    var yAxis = d3.axisLeft(y)
      .ticks(30, "");

    var xAxis = d3.axisBottom(x)
      .tickFormat(d3.timeFormat("%d.%m."))
      .ticks(15);

    var div = d3.select("body").append("div") 
    .attr("class", "tooltip")       
    .style("opacity", 0);

    var svg = d3.select("svg")
      .attr("height",height + margin.top + margin.bottom)
      .attr("width",width + margin.left + margin.right);

    var chartGroup = svg.append("g")
      .attr("transform","translate("+margin.left+","+margin.top+")");

    var rectHeight = 8;
    var rectCorners = 3;

    chartGroup.append("g")
    .attr("class","dataLines")
    .selectAll("line")
        .data(data.filter(function(d){return d.lengthOfCommunication > 1
                                          && d.final;}))
      .enter().append("rect")
        .attr("fill", function(d){
          switch (d.party){
            case "SPD":
              return "red";
            case "CDU":
              return "dimgrey";
            case "CSU":
              return "navy";
            case "DIE LINKE.":
              return "maroon";
            case "AfD":
              return "dodgerblue";
            case "FDP":
              return "gold";
            case "BÜNDNIS 90/DIE GRÜNEN":
              return "yellowgreen";
            default:
              return "fuchsia";
          }
        })
        .attr("defined", true)
        .attr("x", function(d){return x(d.send);})
        .attr("y", function(d){return y(d.lengthOfCommunication) + rectHeight/2;})
        .attr("width", function(d){ return x(d.firstInteractionDate) - x(d.send);})
        .attr("height", rectHeight)
        .attr("rx", rectCorners)
        .attr("ry", rectCorners)
        .on("mouseover", function(d) {
            d3.select(this)
              .attr("fill-opacity", 1)
              .moveToFront();
            div.transition()
                .duration(200)
                .style("opacity", .8);  
            div.html("<h3>" + d.firstname+ " "
                            + d.surname + " ("
                            + d.party + ")</h3><p>"
                            + "Zeitraum bis zur Antwort: " + formatReadableDate(d.send) + " - "
                            + formatReadableDate(d.firstInteractionDate) + "</p><p>"
                            + d.lengthOfCommunication + " Zeichen</p>"
                    )
                .style("left", (d3.event.pageX - 100) + "px")
                .style("top", (d3.event.pageY - 120) + "px");
            })
        .on("mouseout", function(d) {
            d3.select(this)
              .attr("fill-opacity", 0.3)
            div.transition()
                .duration(500)
                .style("opacity", 0);
            })

    chartGroup.append("g")
      .attr("class","axis y")
      .call(yAxis)
      .append("text")
        .attr("class","label")
        .attr("transform", "rotate(-90)")
        .attr("y", -70)
        .attr("x",0 - (height / 2))
        .attr("dy", "1em")
        .style("text-anchor", "middle")
        .text("Zeichenlänge der Kommunikation");

    chartGroup.append("g")
      .attr("class","axis x")
      .attr("transform","translate(0,"+ height + ")")
      .call(xAxis)
      .append("text")
        .attr("class","label")
        .attr("transform","translate(" + (width/2) + " ," + 40 + ")")
        .style("text-anchor", "middle")
        .text("Datum");
  });
}