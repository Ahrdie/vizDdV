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
      return parseReceiveDateFullYear(date + "-" + time)
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
  });
}
