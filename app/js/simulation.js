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
    };

    var will_plot = {
        composite: false,
        damage: false,
        durability: false,
        disruption: false,
        chasedown: false,
        escape: false
    };

    var current_health;
    var current_time;
    var init_targethealth;
    var init_champhealth;

    //This is a stupid hack due to the slows arrays sometimes deciding that they didn't feel like being arrays when asked to do array things
    Target.slows = [];
    Champion.slows = [];

    for (var time = 0; time <= MAX_TIME; time += TIME_STEP) {
        Log += time+": ";
        //A shitty way to allow other scopes access to the current time in the simulation
        SimTime = time;

        //resets will_plot variables
        will_plot = {
            composite: false,
            damage: false,
            durability: false,
            disruption: false,
            chasedown: false,
            escape: false
        };
        init_targethealth = Target.stats.health.current;
        init_champhealth = Champion.stats.health.current;

        //--------------------------------------------
        // Combat Processing
        //--------------------------------------------

        //Champion auto attack
        if(Champion.attacktimer <= 0 && Target.targetable && Champion.crowdcontrol.cantAttack <= 0) {
            Champion.autoAttack();
        }

        //Target auto attack
        if(Target.attacktimer <= 0 && Champion.targetable && Target.crowdcontrol.cantAttack <= 0) {
            Target.autoAttack();
        }

        console.log(Champion);

        //Champion skills
        for (var skill in Champion.skills) {
            if (Champion.skills.hasOwnProperty(skill)) {
                Champion.useSkill(skill);
            }
        }

        //--------------------------------------------
        // Post-Combat Processsing
        //--------------------------------------------
        Target.tickDown();
        Champion.tickDown();

        //Ensure that Distance between combatants is no less than 0
        if (Distance < 0) {
            Distance = 0;
        }

        if (Math.abs(init_champhealth - Champion.stats.health.current) > Champion.stats.health.total * 0.01) {
            will_plot["durability"] = true;
        }
        if (Math.abs(init_targethealth - Target.stats.health.current) > Target.stats.health.total * 0.01) {
            will_plot["damage"] = true;
        }

        //Push graph data to results arrays
        if (will_plot["damage"]) {
            current_time = time / MAX_TIME * 100;
            current_health = 100 - (Math.max(Target.stats.health.current, 0) / Target.stats.health.total * 100);
            result.damage.push([current_time, current_health]);
        }
        if (will_plot["durability"]) {
            current_time = time / MAX_TIME * 100;
            current_health = Math.max(Champion.stats.health.current, 0) / Champion.stats.health.total * 100;
            result.durability.push([current_time, current_health]);
        }

        //Break out of simulation if Target or Champion dies
        if (Target.stats.health.current <= 0) {
            Log += "Target Dies";

            //Adds final data point
            current_time = time / MAX_TIME * 100;
            current_health = 100 - (Math.max(Target.stats.health.current, 0) / Target.stats.health.total * 100);
            result.damage.push([current_time, current_health]);

            current_time = time / MAX_TIME * 100;
            current_health = Math.max(Champion.stats.health.current, 0) / Champion.stats.health.total * 100;
            result.durability.push([current_time, current_health]);

            time = MAX_TIME+1;
        }
        if (Champion.stats.health.current <= 0) {
            Log += "Champion Dies";

            //Adds final data point
            current_time = time / MAX_TIME * 100;
            current_health = 100 - (Math.max(Target.stats.health.current, 0) / Target.stats.health.total * 100);
            result.damage.push([current_time, current_health]);

            current_time = time / MAX_TIME * 100;
            current_health = Math.max(Champion.stats.health.current, 0) / Champion.stats.health.total * 100;
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