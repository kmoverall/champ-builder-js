/**
 * Created by kevinoverall on 5/15/14.
 */

var targetData = null;

$(function() {
    setToPreset("marksman");

    $(".editPreset").click(function () {
        setToPreset(event.target.id);
    });
});

function setToPreset(preset) {
    console.log("Setting Preset");
    var jqxhr = $.getJSON("js/targetpresets.json", function(data){
        targetData = data[preset];
        console.log(targetData);
        //Calculate stat panel info
        document.getElementById("physicalDPS").innerHTML = String(Math.floor(targetData["stats"]["attackdamage"]["current"]*targetData["stats"]["attackspeed"]["current"]*(1+targetData["stats"]["critical"]["chance"]*targetData["stats"]["critical"]["damage"])
                                                                    + targetData["skills"]["0"]["damage"]/targetData["skills"]["0"]["cooldown"]));
        document.getElementById("magicalDPS").innerHTML = String(Math.floor(targetData["skills"]["1"]["damage"]/targetData["skills"]["1"]["cooldown"]));
        document.getElementById("physicalHealth").innerHTML = String(Math.floor(targetData["stats"]["health"]["total"]*((100+targetData["stats"]["armor"]["current"])/100)));
        document.getElementById("magicalHealth").innerHTML = String(Math.floor(targetData["stats"]["health"]["total"]*((100+targetData["stats"]["magicresistance"]["current"])/100)));
    })
        .fail(function() {
            alert( "Error retrieving data from Champ Builder server. Please try again later" );
        });

    jqxhr.complete(function() {

    });
}