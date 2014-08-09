/**
 * Created by kevinoverall on 6/30/14.
 */
var Scripts = {
    load: function() {
        Champion.manaless = true;
        /*Champion.effects.BloodWellRevive = this.BloodWellRevive;
        Champion.effects.BloodWell = this.BloodWell;
        Champion.effects.BloodThirst = this.BloodThirst;*/
        this.Q.cooldown = Champion.data.spells[0].cooldown[this.Q.rank-1]*(1-Champion.stats.cdr);
        this.Q.range = Champion.data.spells[0].range[this.Q.rank-1];
        Champion.skills.push(this.Q);

        this.E.cooldown = Champion.data.spells[2].cooldown[this.E.rank-1]*(1-Champion.stats.cdr);
        this.E.range = Champion.data.spells[2].range[this.E.rank-1];
        Champion.skills.push(this.E);
    },
    Q: {
        rank: 5,
        cooldown: 0,
        range: 0,
        cdtimer: 0,
        aoe: true,
        cast: function() {
            if (Distance <= this.range && Target.targetable && Champion.crowdcontrol.cantCast <= 0 && Champion.crowdcontrol.cantMove <= 0) {
                //Apply health cost
                var cost = Champion.stats.health.current * (Champion.data.spells[0].effect[2][this.rank-1] / 100);
                Champion.stats.health.current -= cost;
                //Store in the blood well
                Champion.stats.mana.current = Math.min(Champion.stats.mana.current + cost, Champion.stats.mana.total);

                Log += "\t" + Champion.data.name + " casts Dark Flight for " + cost + " health";

                //Close the gap
                Distance = Math.max(Distance - this.range, 0);

                //Calculate and apply damage
                var basedamage = Champion.data.spells[0].effect[0][this.rank-1];
                var scalingdamage = Champion.data.spells[0].vars[0].coeff[0] * Champion.stats[STAT_LINK_MAP[ Champion.data.spells[0].vars[0]["link"] ][0]][STAT_LINK_MAP[ Champion.data.spells[0].vars[0]["link"] ][1]];
                Target.takeDamage(basedamage + scalingdamage, DAMAGE_TYPES.PHYSICAL, DAMAGE_SOURCE.SKILL);

                //TODO: Champion and Target need generic useSkill functions that call these cast functions. Cast Functions return damage to the useSkill function

                //Apply CC
                Log += "\tTarget is knocked up for "+ Champion.data.spells[0].effect[4][this.rank-1] +"s\n";
                Target.applyCC(Champion.data.spells[0].effect[4][this.rank-1], Champion.data.spells[0].effect[4][this.rank-1], Champion.data.spells[0].effect[4][this.rank-1], {}, true);

                //Start Cooldown
                this.cdtimer = this.cooldown;
            }
        }
    },
    W: {
        cast: function() {}
    },
    E: {
        rank: 5,
        cooldown: 0,
        range: 0,
        cdtimer: 0,
        aoe: true,
        cast: function() {
            if (Distance <= this.range && Target.targetable && Champion.crowdcontrol.cantCast <= 0) {
                //Apply health cost
                var cost = Champion.stats.health.current * (Champion.data.spells[2].effect[4][this.rank-1] / 100);
                Champion.stats.health.current -= cost;
                //Store in the blood well
                Champion.stats.mana.current = Math.min(Champion.stats.mana.current + cost, Champion.stats.mana.total);

                Log += "\t" + Champion.data.name + " casts Blades of Torment for " + cost + " health";

                //Calculate and apply damage
                var basedamage = Champion.data.spells[2].effect[0][this.rank-1];
                var scalingdamage = Champion.data.spells[2].vars[0].coeff[0] * Champion.stats[STAT_LINK_MAP[ Champion.data.spells[2].vars[0]["link"] ][0]][STAT_LINK_MAP[ Champion.data.spells[2].vars[0]["link"] ][1]];
                scalingdamage += Champion.data.spells[2].vars[1].coeff[0] * Champion.stats[STAT_LINK_MAP[ Champion.data.spells[2].vars[1]["link"] ][0]][STAT_LINK_MAP[ Champion.data.spells[2].vars[1]["link"] ][1]];
                Target.takeDamage(basedamage + scalingdamage, DAMAGE_TYPES.MAGIC, DAMAGE_SOURCE.SKILL);

                //Apply CC

                Log += "\tTarget is slowed by " + Champion.data.spells[2].effect[1][this.rank - 1] + "% for " + Champion.data.spells[2].effect[3][this.rank - 1] + " seconds\n";
                Target.applyCC(0, 0, 0, {
                    strength: Champion.data.spells[2].effect[1][this.rank - 1],
                    duration: Champion.data.spells[2].effect[3][this.rank - 1],
                    decayTo: Champion.data.spells[2].effect[1][this.rank - 1],
                    current: Champion.data.spells[2].effect[1][this.rank - 1],
                    slowtimer: Champion.data.spells[2].effect[3][this.rank - 1]
                }, false);

                //Start Cooldown
                this.cdtimer = this.cooldown;
            }
        }
    },
    R: {
        cast: function() {}
    },
    BloodWellRevive: {
        debuff: false,
        duration: 0,
        apply: function() {},
        tick: function() {},
        eventTrigger: function(magnitude, type, source) {},
        remove: function() {}
    },
    BloodWell: {
        debuff: false,
        duration: 0,
        apply: function() {},
        tick: function() {},
        eventTrigger: function(magnitude, type, source) {},
        remove: function() {}
    },
    BloodThirst: {
        debuff: false,
        duration: 0,
        apply: function() {},
        tick: function() {},
        eventTrigger: function(magnitude, type, source) {},
        remove: function() {}
    },
    BloodPrice: {
        debuff: false,
        duration: 0,
        apply: function() {},
        tick: function() {},
        eventTrigger: function(magnitude, type, source) {},
        remove: function() {}
    },
    Massacre: {
        debuff: false,
        duration: 0,
        apply: function() {},
        tick: function() {},
        eventTrigger: function(magnitude, type, source) {},
        remove: function() {}
    }

}