/**
 * Created by kevinoverall on 6/7/14.
 */
function simulate() {

    var MAX_TIME = 20;
    var TIME_STEP = 0.1;

    $.getScript( Champion.scriptlocation, function( data, textStatus, jqxhr ) {
        console.log("loaded champ scripts: "+Champion.scriptlocation);

        var time = 0;

        for (var i = 0; i <= MAX_TIME; i += TIME_STEP) {
            //Champion auto attack
            Champion.attacktimer -= TIME_STEP;
            if(Champion.attacktimer <= 0) {
                Champion.autoAttack();
            }

            //Target auto attack
            Target.attacktimer -= TIME_STEP;
            if(Target.attacktimer <= 0) {
                Target.autoAttack();
            }
        }

        return {
            composite: [[0, 0], [10, 25], [20, 100]],
            damage: [[0, 0], [10, 25], [20, 100]],
            durability: [[0, 0], [10, 25], [20, 100]],
            disruption: [[0, 0], [10, 25], [20, 100]],
            chasedown: [[0, 0], [10, 25], [20, 100]],
            escape: [[0, 0], [10, 25], [20, 100]]
        };
    });


}