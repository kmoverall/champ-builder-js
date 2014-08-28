/**
 * Created by kevinoverall on 8/28/14.
 */
$(function() {
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