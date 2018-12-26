var dataContent;

d3.text("data.csv").then(function(text){
    //console.log(text);
    dataContent = text;
    drawData();
});

function drawData(){

  var ssv = d3.dsvFormat(";"); // ssv := semicolon seperated values

  var parseBirthday = d3.timeParse("%d.%m.%Y");

  var data = ssv.parse(dataContent, function(d){
    return{
      id:         +d.identification,
      firstname:  d.vorname,
      surname:    d.Nachname_zusammen,
      birthday:   parseBirthday(d.gebdatum),
      fraction:   d.fraktion,
      party:      d.partei,
      religion:   d.religion,
      randGroup:  d.randomisierungsgruppe

    };
  });

  console.log(data);
}
