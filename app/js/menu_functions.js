/**
 * Created by kevinoverall on 8/28/14.
 */
$(function() {

    //Champion Loading Funcionality
    loadChampion("aatrox");

    //Target Preset Functionality
    setToPreset("marksman");

    $(".editPreset").click(function () {
        setToPreset(event.target.id);
    });


    //Champion Selection Functionality
    $(".champ-image").css('cursor', 'pointer');

    $('.champ-image').click(function () {
        loadChampion($(this).data("selector"));
        clearGraphs();
        var portrait = document.getElementById("champion-portrait");
        portrait.setAttribute("src", $(this).attr("src"));
        portrait.setAttribute("alt", $(this).attr("alt"));

        document.getElementById("champion-name").innerHTML = $(portrait).attr("alt");

        var skill_icon = document.getElementById("champion-Q");
        skill_icon.setAttribute("src", "img/abilities/"+$(portrait).attr("alt")+"_Q.png");

        skill_icon = document.getElementById("champion-W");
        skill_icon.setAttribute("src", "img/abilities/"+$(portrait).attr("alt")+"_W.png");

        skill_icon = document.getElementById("champion-E");
        skill_icon.setAttribute("src", "img/abilities/"+$(portrait).attr("alt")+"_E.png");

        skill_icon = document.getElementById("champion-R");
        skill_icon.setAttribute("src", "img/abilities/"+$(portrait).attr("alt")+"_R.png");
    });
});

function loadChampion(champName) {
    champId = CHAMP_ID_MAP[champName];
    var jqxhr = $.getJSON("https://na.api.pvp.net/api/lol/static-data/na/v1.2/champion/"+champId+"?champData=all&api_key=d4e9f82e-4344-4719-a68f-1015c61a6bb4", function(data) {
        Champion.data = data;
        Champion.scriptlocation = "js/champion_scripts/"+champName+".js";
        Champion.initialize();
        console.log(Champion);
    })
        .fail(function() {
            alert( "Error connecting to Riot API. Please try again later" );
        });

}

function setToPreset(preset) {
    console.log("Setting Preset to "+preset);
    var jqxhr = $.getJSON("js/targetpresets.json", function(preset_data){
        Target.stats = preset_data[preset]["stats"];
        Target.skills = preset_data[preset]["skills"];

        document.getElementById("target-portrait").setAttribute("src", "img/portraits/" + preset_data[preset]["portrait"]);

        //Calculate stat panel info
        document.getElementById("physicalDPS").innerHTML = String(Math.floor(Target.stats.attackdamage.current * Target.stats.attackspeed.current * (1+Target.stats.critical.chance * Target.stats.critical.damage)
            + Target.skills[0].damage / Target.skills[0].cooldown));
        document.getElementById("magicalDPS").innerHTML = String(Math.floor(Target.skills[1].damage / Target.skills[1].cooldown));
        document.getElementById("physicalHealth").innerHTML = String(Math.floor(Target.stats.health.total * ((100+Target.stats.armor.current)/100)));
        document.getElementById("magicalHealth").innerHTML = String(Math.floor(Target.stats.health.total * ((100+Target.stats.magicresistance.current)/100)));
    })
        .fail(function() {
            alert( "Error retrieving data from Champ Builder server. Please try again later" );
        });

    jqxhr.complete(function() {

    });
}