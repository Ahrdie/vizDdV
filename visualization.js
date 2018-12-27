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
    var parseLetterSendDate = d3.timeParse("%m/%d/%y");
    var parseMailSendTime = d3.timeParse("%d-%B-%Y-%H:%M");

    function parseSendDate(letter, mailSendDate, sendTime, letterSendDate){

        if(letter == 0) {
            var t = parseMailSendTime(mailSendDate + "-2018-" + sendTime)
            return t;

        } else if (letter == 1) {
          return parseLetterSendDate(letterSendDate);
        } else {
          return null
        }
    }

    var data = ssv.parse(dataContent, function(d){

      return{
        id:         +d.identification,
        firstname:  d.vorname,
        surname:    d.Nachname_zusammen,
        birthday:   parseBirthday(d.gebdatum),
        fraction:   d.fraktion,
        party:      d.partei,
        religion:   d.religion,
        randGroup:  d.randomisierungsgruppe,
        letter:     d.Brief,
        send:       parseSendDate(+d.Brief, d.EigenesSendedatum, d.EigeneSendezeit, d.Versand1_imputiert)
      };
    });

    console.log(data);
  });
}
