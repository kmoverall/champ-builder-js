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

    //This is a stupid hack due to the slows arrays sometimes deciding that they didn't feel like being arrays when asked to do array things
    Target.slows = [];
    Champion.slows = [];

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
        if(Champion.attacktimer <= 0 && Target.targetable && Champion.crowdcontrol.cantAttack <= 0) {
            Champion.autoAttack();
            will_plot["damage"] = true;
        }

        //Target auto attack
        Target.attacktimer -= TIME_STEP;
        if(Target.attacktimer <= 0 && Champion.targetable && Target.crowdcontrol.cantAttack <= 0) {
            Target.autoAttack();
            will_plot["durability"] = true;
        }

        //Champion skills
        for (var skill in Champion.skills) {
            if (Champion.skills.hasOwnProperty(skill)) {
                Champion.skills[skill].cdtimer -= TIME_STEP;
                if(Champion.skills[skill].cdtimer <=0 && Target.targetable) {
                    Champion.skills[skill].cast();
                    will_plot["damage"] = true;
                    will_plot["durability"] = true;
                }
            }
        }

        // Apply regeneration every 0.5 seconds. Method of determining this is weird due to float rounding errors
        // Regen must be divided by 10, as it is stored as per 5s
        if(time % 0.5 > (time + TIME_STEP)% 0.5) {
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

        //Reduce CC duration
        for (var cc in Target.crowdcontrol) {
            if (Target.crowdcontrol.hasOwnProperty(cc)) {
                Target.crowdcontrol[cc] -= TIME_STEP;
                if(Target.crowdcontrol[cc] <= 0) {
                    Target.crowdcontrol[cc] = 0;
                }
            }
        }
        for (var cc in Champion.crowdcontrol) {
            if (Champion.crowdcontrol.hasOwnProperty(cc)) {
                Champion.crowdcontrol[cc] -= TIME_STEP;
                if(Champion.crowdcontrol[cc] <= 0) {
                    Champion.crowdcontrol[cc] = 0;
                }
            }

        }

        //Reduce slow durations, needs to calculate and recalculate movespeeds based on slows coming and going
        for (var slow in Target.slows) {
            if (Target.slows.hasOwnProperty(slow)) {
                Target.slows[slow].duration -= TIME_STEP;
                if(Target.slows[slow].duration <= 0) {
                    Target.slows.splice(slow, 1);
                }
            }
        }
        for (var slow in Champion.slows) {
            if (Champion.slows.hasOwnProperty(slow)) {
                Champion.slows[slow].duration -= TIME_STEP;
                if(Champion.slows[slow].duration <= 0) {
                    Champion.slows.splice(slow, 1);
                }
            }
        }

        //Ensure that Distance between combatants is no less than 0
        if (Distance < 0) {
            Distance = 0;
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