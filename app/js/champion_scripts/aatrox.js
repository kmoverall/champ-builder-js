/**
 * Created by kevinoverall on 6/30/14.
 */
var Scripts = {
    load: function() {
        Champion.manaless = true;
        /*Champion.effects.BloodWellRevive = this.BloodWellRevive;
        Champion.effects.BloodWell = this.BloodWell;
        Champion.effects.BloodThirst = this.BloodThirst;*/
        this.Q.range = Champion.data.spells[0].range[this.Q.rank-1];
        Champion.skills.push(this.Q);

        this.E.range = Champion.data.spells[2].range[this.E.rank-1];
        Champion.skills.push(this.E);
    },
    Q: {
        name: "Dark Flight",
        rank: 5,
        cooldown: 0,
        range: 0,
        cdtimer: 0,
        aoe: true,
        willCast: function() {
            return this.cdtimer <= 0 && Distance <= this.range && Target.targetable && !Champion.crowdcontrol.cantCast && !Champion.crowdcontrol.cantMove;
        },
        cast: function() {
            //Set Variables
            this.cooldown = Champion.data.spells[0].cooldown[this.rank-1]*(1-Champion.stats.cdr);

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

            //Apply CC
            Log += "\tTarget is knocked up for "+ Champion.data.spells[0].effect[4][this.rank-1] +"s\n";
            Scripts.effects.DarkFlight.duration = Champion.data.spells[0].effect[4][this.rank-1];
            Target.addEffect(Scripts.effects.DarkFlight);

            //Start Cooldown
            this.cdtimer = this.cooldown;
        }
    },
    W: {
        cast: function() {}
    },
    E: {
        name: "Blades of Torment",
        rank: 5,
        cooldown: 0,
        range: 0,
        cdtimer: 0,
        aoe: true,
        moves: false,
        willCast: function() {
            return this.cdtimer <= 0 && Distance <= this.range && Target.targetable && !Champion.crowdcontrol.cantCast;
        },
        cast: function() {
            //Set Variables
            this.cooldown = Champion.data.spells[2].cooldown[this.rank-1]*(1-Champion.stats.cdr);

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
            Scripts.effects.BladesOfTorment.duration = Champion.data.spells[2].effect[3][this.rank - 1] * (1-Champion.stats.tenacity);
            Scripts.effects.BladesOfTorment.strength = Champion.data.spells[2].effect[1][this.rank - 1] * (1-Champion.stats.slowresist);
            Target.addEffect(Scripts.effects.BladesOfTorment);

            //Start Cooldown
            this.cdtimer = this.cooldown;
        }

    },
    R: {
        cast: function() {}
    },
    effects: {
        DarkFlight: {
            name: "Dark Flight Knockup",
            debuff: true,
            cleansable: false,
            duration: 0,
            apply: function () {
                Target.crowdcontrol.cantMove = true;
                Target.crowdcontrol.cantCast = true;
                Target.crowdcontrol.cantAttack = true;
                Target.crowdcontrol.airborne = true;
            },
            tick: function () {
                Target.crowdcontrol.cantMove = true;
                Target.crowdcontrol.cantCast = true;
                Target.crowdcontrol.cantAttack = true;
                Target.crowdcontrol.airborne = true;
            },
            remove: function () {
                Target.crowdcontrol.cantMove = false;
                Target.crowdcontrol.cantCast = false;
                Target.crowdcontrol.cantAttack = false;
                Target.crowdcontrol.airborne = false;
            }
        },
        BladesOfTorment: {
            name: "Blades of Torment Slow",
            debuff: true,
            cleansable: true,
            duration: 0,
            strength: 0,
            apply: function () {
                Target.slows[this.name] = this.strength;
            },
            tick: function () {},
            remove: function () {
                delete Target.slows[name];
            }
        },
        BloodWellRevive: {
            name: "Blood Well Revive",
            debuff: false,
            cleansable: false,
            duration: 1000000,
            apply: function () {
            },
            tick: function () {
            },
            remove: function () {
            }
        },
        BloodWell: {
            name: "Blood Well",
            debuff: false,
            cleansable: false,
            duration: 0,
            apply: function () {
            },
            tick: function () {
            },
            remove: function () {
            }
        },
        BloodThirst: {
            debuff: false,
            cleansable: false,
            duration: 0,
            apply: function () {
            },
            tick: function () {
            },
            remove: function () {
            }
        },
        BloodPrice: {
            debuff: false,
            cleansable: false,
            duration: 0,
            apply: function () {
            },
            tick: function () {
            },
            remove: function () {
            }
        },
        Massacre: {
            debuff: false,
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

    }
};