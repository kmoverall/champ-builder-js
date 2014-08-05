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

    for (var time = 0; time <= MAX_TIME; time += TIME_STEP) {
        Log += time+": ";

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
        // Combat Processing
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

        // Apply regeneration every 0.5 seconds
        // Health must be divided by 10, as it is stored as per 5s
        // < TIME_STEP / 2 instead of == 0 accommodates for floating point errors
        if((time*2) % 1 < TIME_STEP / 2) {
            Target.heal(Target.stats.healthregen.current / 10);
            Target.stats.mana.current += Target.stats.manaregen.current / 10;

            Champion.heal(Champion.stats.healthregen.current / 10);
            Champion.stats.mana.current += Champion.stats.manaregen.current / 10;
        }

        //--------------------------------------------
        // Post-Combat Processsing
        //--------------------------------------------

        //Ensure that Target and Champion health and mana is between 0 and max
        if (Target.stats.health.current > Target.stats.health.total) {
            Target.stats.health.current = Target.stats.health.total;
        }
        else if (Target.stats.health.current < 0) {
            Target.stats.health.current = 0;
        }

        if (Target.stats.mana.current > Target.stats.mana.total) {
            Target.stats.mana.current = Target.stats.mana.total;
        }
        else if (Target.stats.mana.current < 0) {
            Target.stats.mana.current = 0;
        }

        if (Champion.stats.health.current > Champion.stats.health.total) {
            Champion.stats.health.current = Champion.stats.health.total;
        }
        else if (Champion.stats.health.current < 0) {
            Champion.stats.health.current = 0;
        }

        if (Champion.stats.mana.current > Champion.stats.mana.total) {
            Champion.stats.mana.current = Champion.stats.mana.total;
        }
        else if (Champion.stats.mana.current < 0) {
            Champion.stats.mana.current = 0;
        }

        //Push graph data to results arrays
        if (will_plot["damage"]) {
            var current_time = time / MAX_TIME * 100;
            var current_health = 100 - (Math.max(Target.stats.health.current, 0) / Target.stats.health.total * 100);
            result.damage.push([current_time, current_health]);
        }
        if (will_plot["durability"]) {
            var current_time = time / MAX_TIME * 100;
            var current_health = Math.max(Champion.stats.health.current, 0) / Champion.stats.health.total * 100;
            result.durability.push([current_time, current_health]);
        }

        //Break out of simulation if Target or Champion dies
        if (Target.stats.health.current <= 0) {
            Log += "Target Dies";

            //Adds final data point
            var current_time = time / MAX_TIME * 100;
            var current_health = 100 - (Math.max(Target.stats.health.current, 0) / Target.stats.health.total * 100);
            result.damage.push([current_time, current_health]);

            var current_time = time / MAX_TIME * 100;
            var current_health = Math.max(Champion.stats.health.current, 0) / Champion.stats.health.total * 100;
            result.durability.push([current_time, current_health]);

            time = MAX_TIME+1;
        }
        if (Champion.stats.health.current <= 0) {
            Log += "Champion Dies";

            //Adds final data point
            var current_time = time / MAX_TIME * 100;
            var current_health = 100 - (Math.max(Target.stats.health.current, 0) / Target.stats.health.total * 100);
            result.damage.push([current_time, current_health]);

            var current_time = time / MAX_TIME * 100;
            var current_health = Math.max(Champion.stats.health.current, 0) / Champion.stats.health.total * 100;
            result.durability.push([current_time, current_health]);

            time = MAX_TIME+1;
        }

        Log += "<br>"
    }

    //Put log on screen
    document.getElementById("log").innerHTML = Log;

    console.log(result);
    return result;
}