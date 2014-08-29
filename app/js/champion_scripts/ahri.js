/**
 * Created by kevinoverall on 8/28/14.
 */
var Scripts = {
    load: function() {
        //Set constant attributes, such as manalessness

        console.log("Scripts.load Called");
        //Add Effects, initializing numbers as necessary from the Riot API
        //Initializing numbers should only be necessary if the effect scales with rank/level/etc.
        Champion.skills.push(this.Q);

        //Add Skills in order of highest casting priority to lowest
    },
    Q: {
        name: "Orb of Deception",
        rank: 5,
        range: 880,
        cdtimer: 0,
        casttime: 0.25,
        aoe: true,
        //A Generic willCast function
        willCast: function() {
            return this.cdtimer <= 0 && Distance <= this.range && Target.targetable && !Champion.crowdcontrol.cantCast && !Champion.isAnimating();
        },
        cast: function() {

            //Apply mana costs
            Champion.stats.mana.current -= Champion.data.spells[0].cost[this.rank-1];
            Log += "\t" + Champion.data.name + " casts " + this.name + " for " + Champion.data.spells[0].cost[this.rank-1] + " mana";

            //Calculate and apply damage
            var basedamage = Champion.data.spells[0].effect[0][this.rank-1];
            var scalingstat = Champion.data.spells[0].vars[0]["link"];
            var scalingdamage = Champion.data.spells[0].vars[0].coeff[0] * Champion.stats[STAT_LINK_MAP[scalingstat][0]] [STAT_LINK_MAP[scalingstat][1]];
            Target.takeDamage(basedamage + scalingdamage, DAMAGE_TYPES.MAGIC, DAMAGE_SOURCE.SKILL);
            Target.takeDamage(basedamage + scalingdamage, DAMAGE_TYPES.TRUE, DAMAGE_SOURCE.SKILL);

            //Start Cooldown
            this.cdtimer = Champion.data.spells[0].cooldown[this.rank-1]*(1-Champion.stats.cdr);
        }
    },
    effects: {
        Effect: {
            name: "",
            debuff: true,
            cleansable: false,
            duration: 0,
            apply: function () {
            },
            tick: function () {
            },
            remove: function () {
            }
        }
    },
    events: {
        BloodThirst: {
            name: "Event",
            triggerEvent: function (arguments) {
            }
        }
    }
};