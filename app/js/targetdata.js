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
    var jqxhr = $.getJSON("js/targetpresets.json", function(data){
        targetData = data[preset];

        //Calculate stat panel info
        document.getElementById("physicalDPS").innerHTML = String(targetData["attackdamage"]*targetData["attackspeed"] + targetData["physicaldps"]);
        document.getElementById("magicalDPS").innerHTML = targetData["magicaldps"];
        document.getElementById("physicalHealth").innerHTML = String(targetData["health"]*((100+targetData["armor"])/100));
        document.getElementById("magicalHealth").innerHTML = String(targetData["health"]*((100+targetData["magicresistance"])/100));
    });

    jqxhr.complete(function() {

    });
}