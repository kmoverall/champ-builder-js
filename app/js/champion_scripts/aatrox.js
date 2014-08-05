/**
 * Created by kevinoverall on 6/30/14.
 */
var Scripts = {
    load: function() {
        Champion.manaless = true;
        /*Champion.effects.BloodWellRevive = this.BloodWellRevive;
        Champion.effects.BloodWell = this.BloodWell;
        Champion.effects.BloodThirst = this.BloodThirst;*/
        this.Q.cooldown = Champion.data.spells[0].cooldown[this.Q.rank]*(1-Champion.stats.cdr);
        this.Q.range = Champion.data.spells[0].range[this.Q.rank]
        Champion.skills.push(this.Q);
    },
    Q: {
        rank: 4,
        cooldown: 0,
        range: 0,
        cdtimer: 0,
        aoe: true,
        cast: function() {
            if (Distance <= this.range && Target.targetable && !Champion.crowdcontrol.cantCast && !Champion.crowdcontrol.cantMove) {
                //Apply health cost
                var cost = Champion.stats.health.current * (Champion.data.spells[0].effect[2][this.rank] / 100);
                Champion.stats.health.current -= cost;
                //Store in the blood well
                Champion.stats.mana.current += cost;

                Log += "\t" + Champion.data.name + " casts Dark Flight for " + cost + " health";

                //Close the gap
                Distance = Math.max(Distance - this.range, 0);

                //Calculate and apply damage
                var basedamage = Champion.data.spells[0].effect[0][this.rank];
                var scalingdamage = Champion.data.spells[0].vars[0].coeff[0] * Champion.stats[STAT_LINK_MAP[ Champion.data.spells[0].vars[0]["link"] ][0]][STAT_LINK_MAP[ Champion.data.spells[0].vars[0]["link"] ][1]];
                Target.takeDamage(basedamage + scalingdamage, DAMAGE_TYPES.PHYSICAL, DAMAGE_SOURCE.SKILL);

                //Apply CC

                Log += "\tTarget is knocked up for 1s\n";
                Target.crowdcontrol.cantMove += 1;
                Target.crowdcontrol.cantAttack += 1;
                Target.crowdcontrol.cantCast += 1;

                //Reset Cooldown
                this.cdtimer = this.cooldown;
            }
        }
    },
    W: {
        cast: function() {}
    },
    E: {
        cast: function() {}
    },
    R: {
        cast: function() {}
    },
    BloodWellRevive: {
        apply: function() {},
        tick: function() {},
        eventTriggered: function() {},
        remove: function() {}
    },
    BloodWell: {
        apply: function() {},
        tick: function() {},
        eventTriggered: function() {},
        remove: function() {}
    },
    BloodThirst: {
        apply: function() {},
        tick: function() {},
        eventTriggered: function() {},
        remove: function() {}
    },
    BloodPrice: {
        apply: function() {},
        tick: function() {},
        eventTriggered: function() {},
        remove: function() {}
    },
    Massacre: {
        apply: function() {},
        tick: function() {},
        eventTriggered: function() {},
        remove: function() {}
    }

}