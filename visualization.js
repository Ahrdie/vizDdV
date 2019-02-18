var dataContent;

d3.text("data.csv").then(function(text){
    dataContent = text;
    drawData();
});

function drawData(){
  d3.json("https://unpkg.com/d3-time-format@2/locale/de-DE.json").then(function(locale) {
    d3.timeFormatDefaultLocale(locale);                   // setting german as language for timestamps

    var ssv = d3.dsvFormat(";");                          // ssv := semicolon seperated values
    var parseBirthday =     d3.timeParse("%d.%m.%Y");
    var parseSlashDate = d3.timeParse("%m/%d/%y");
    var parseMailSendTime = d3.timeParse("%d-%B-%Y-%H:%M");
    var parseReceiveDate = d3.timeParse("%m/%d/%y-%H:%M");
    var parseReceiveDateFullYear = d3.timeParse("%m/%d/%Y-%H:%M");

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
        return parseReceiveDate(date + "-" + time)
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
        secondInteractionDate:  parseDate2(d.Datum2, d.Zeit2)
      };
    });

    console.log(data);

    var height = 300;
    var width = 500;
    var margin = {left:50,right:50,top:40,bottom:0}
    
    var allDates = getAllDates(data);
    var timeRange = d3.extent(allDates);
    var idRange = d3.extent(data, function(d){return d.id})
    var maxComLength = d3.max(data, function(d){return Math.abs(d.lengthOfCommunication)})

    var y = d3.scaleLinear()
              .domain([0,maxComLength])
              .range([height,0]);

    //var x = d3.scaleTime()
    //          .domain(timeRange)
    //          .range([0,width]);

    var x = d3.scaleLinear()
      .domain(idRange)
      .range([0,width])

    var heightPerBar = width / data.length;

    var yAxis = d3.axisLeft(y);
    var xAxis = d3.axisBottom(x);

    var svg = d3.select("svg")
      .attr("height",height + margin.top + margin.bottom)
      .attr("width",width + margin.left + margin.right);

    var chartGroup = svg.append("g")
      .attr("transform","translate("+margin.left+","+margin.top+")");

    chartGroup.selectAll("bar")
        .data(data)
      .enter().append("rect")
        .style("fill", "steelblue")
        .attr("x", function(d) {return x(d.id);})
        .attr("width", 1)
        .attr("y", function(d){ return y(d.lengthOfCommunication);})
        .attr("height", function(d) { return height - y(d.lengthOfCommunication);})

  });
}
