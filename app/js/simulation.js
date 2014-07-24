/**
 * Created by kevinoverall on 6/7/14.
 */
function simulate() {

    $.getScript( championData["script"], function( data, textStatus, jqxhr ) {
        console.log("loaded champ scripts: "+championData["script"]);
        var simChamp = new Champion();
        simChamp.initialize();
        console.log("Created champion");
        console.log(simChamp);
    });

    return {
        composite: [[0, 0], [10, 25], [20, 100]],
        damage: [[0, 0], [10, 25], [20, 100]],
        durability: [[0, 0], [10, 25], [20, 100]],
        disruption: [[0, 0], [10, 25], [20, 100]],
        chasedown: [[0, 0], [10, 25], [20, 100]],
        escape: [[0, 0], [10, 25], [20, 100]]
    };
}