/**
 * Created by kevinoverall on 6/7/14.
 */

function simulate() {

    Log = "";

    var result = {
        composite: [[0, 0], [50, 25], [100, 100]],
        damage: [[0, 0]],
        durability: [[0, 100]],
        disruption: [[0, 0], [50, 25], [100, 100]],
        chasedown: [[0, 0], [50, 25], [100, 100]],
        escape: [[0, 0], [50, 25], [100, 100]]
    }

    var will_plot = {
        composite: false,
        damage: false,
        durability: false,
        disruption: false,
        chasedown: false,
        escape: false
    };

    for (var i = 0; i <= MAX_TIME; i += TIME_STEP) {
        Log += i+": ";

        //resets will_plot variables
        will_plot = {
            composite: false,
            damage: false,
            durability: false,
            disruption: false,
            chasedown: false,
            escape: false
        };

        //--------------------------------------------
        //Combat Processing
        //--------------------------------------------

        //Champion auto attack
        Champion.attacktimer -= TIME_STEP;
        if(Champion.attacktimer <= 0 && Target.targetable) {
            Champion.autoAttack();
            will_plot["damage"] = true;
        }

        //Target auto attack
        Target.attacktimer -= TIME_STEP;
        if(Target.attacktimer <= 0 && Champion.targetable) {
            Target.autoAttack();
            will_plot["durability"] = true;
        }

        //Ensure that Target and Champion health is between 0 and max
        if (Target.stats.health.current > Target.stats.health.total) {
            Target.stats.health.current = Target.stats.health.total;
        } else if (Target.stats.health.current < 0) {
            Target.stats.health.current = 0;
        }

        if (Champion.stats.health.current > Champion.stats.health.total) {
            Champion.stats.health.current = Champion.stats.health.total;
        } else if (Champion.stats.health.current < 0) {
            Champion.stats.health.current = 0;
        }


        //--------------------------------------------
        //Post-Combat Processsing
        //--------------------------------------------

        //Push graph data to results arrays
        if (will_plot["damage"]) {
            var current_time = i / MAX_TIME * 100;
            var current_health = 100 - (Math.max(Target.stats.health.current, 0) / Target.stats.health.total * 100);
            result.damage.push([current_time, current_health]);
        }
        if (will_plot["durability"]) {
            var current_time = i / MAX_TIME * 100;
            var current_health = Math.max(Champion.stats.health.current, 0) / Champion.stats.health.total * 100;
            result.durability.push([current_time, current_health]);
        }

        //Break out of simulation if Target or Champion dies
        if (Target.stats.health.current <= 0) {
            Log += "Target Dies";

            //Adds final data point
            var current_time = i / MAX_TIME * 100;
            var current_health = 100 - (Math.max(Target.stats.health.current, 0) / Target.stats.health.total * 100);
            result.damage.push([current_time, current_health]);

            var current_time = i / MAX_TIME * 100;
            var current_health = Math.max(Champion.stats.health.current, 0) / Champion.stats.health.total * 100;
            result.durability.push([current_time, current_health]);

            i = MAX_TIME+1;
        }
        if (Champion.stats.health.current <= 0) {
            Log += "Champion Dies";

            //Adds final data point
            var current_time = i / MAX_TIME * 100;
            var current_health = 100 - (Math.max(Target.stats.health.current, 0) / Target.stats.health.total * 100);
            result.damage.push([current_time, current_health]);

            var current_time = i / MAX_TIME * 100;
            var current_health = Math.max(Champion.stats.health.current, 0) / Champion.stats.health.total * 100;
            result.durability.push([current_time, current_health]);

            i = MAX_TIME+1;
        }

        Log += "<br>"
    }

    //Put log on screen
    document.getElementById("log").innerHTML = Log;

    console.log(result);
    return result;
}