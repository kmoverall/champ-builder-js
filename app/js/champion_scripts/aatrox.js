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

        this.R.range = Champion.data.spells[3].range[this.R.rank-1];
        Champion.skills.push(this.R);
    },
    Q: {
        name: "Dark Flight",
        rank: 5,
        range: 0,
        cdtimer: 0,
        aoe: true,
        willCast: function() {
            return this.cdtimer <= 0 && Distance <= this.range && Target.targetable && !Champion.crowdcontrol.cantCast && !Champion.crowdcontrol.cantMove;
        },
        cast: function() {

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
            var scalingstat = Champion.data.spells[0].vars[0]["link"];
            var scalingdamage = Champion.data.spells[0].vars[0].coeff[0] * Champion.stats[STAT_LINK_MAP[scalingstat][0]] [STAT_LINK_MAP[scalingstat][1]];
            Target.takeDamage(basedamage + scalingdamage, DAMAGE_TYPES.PHYSICAL, DAMAGE_SOURCE.SKILL);

            //Apply CC
            Scripts.effects.DarkFlight.duration = Champion.data.spells[0].effect[4][this.rank-1];
            Target.addEffect(Scripts.effects.DarkFlight);

            //Start Cooldown
            this.cdtimer = Champion.data.spells[0].cooldown[this.rank-1]*(1-Champion.stats.cdr);
        }
    },
    W: {
        name: "Blades of Torment",
        rank: 5,
        range: 0,
        cdtimer: 0,
        aoe: true,
        moves: false,
        willCast: function() {

        },
        cast: function() {

        }
    },
    E: {
        name: "Blades of Torment",
        rank: 5,
        range: 0,
        cdtimer: 0,
        aoe: true,
        moves: false,
        willCast: function() {
            return this.cdtimer <= 0 && Distance <= this.range && Target.targetable && !Champion.crowdcontrol.cantCast;
        },
        cast: function() {
            //Apply health cost
            var cost = Champion.stats.health.current * (Champion.data.spells[2].effect[4][this.rank-1] / 100);
            Champion.stats.health.current -= cost;
            //Store in the blood well
            Champion.stats.mana.current = Math.min(Champion.stats.mana.current + cost, Champion.stats.mana.total);

            Log += "\t" + Champion.data.name + " casts Blades of Torment for " + cost + " health";

            //Calculate and apply damage
            var basedamage = Champion.data.spells[2].effect[0][this.rank-1];
            var scalingstat = [];
            scalingstat[0] = Champion.data.spells[2].vars[0]["link"];
            scalingstat[1] = Champion.data.spells[2].vars[1]["link"];
            var scalingdamage = Champion.data.spells[2].vars[0].coeff[0] * Champion.stats[STAT_LINK_MAP[scalingstat[0]][0]] [STAT_LINK_MAP[scalingstat[0]][1]];
            scalingdamage += Champion.data.spells[2].vars[1].coeff[0] * Champion.stats[STAT_LINK_MAP[scalingstat[1]][0]] [STAT_LINK_MAP[scalingstat[1]][1]];
            Target.takeDamage(basedamage + scalingdamage, DAMAGE_TYPES.MAGIC, DAMAGE_SOURCE.SKILL);

            //Apply CC
            Scripts.effects.BladesOfTorment.duration = Champion.data.spells[2].effect[3][this.rank - 1] * (1-Champion.stats.tenacity);
            Scripts.effects.BladesOfTorment.strength = Champion.data.spells[2].effect[1][this.rank - 1] * (1-Champion.stats.slowresist);
            Target.addEffect(Scripts.effects.BladesOfTorment);

            //Start Cooldown
            this.cdtimer = Champion.data.spells[2].cooldown[this.rank-1]*(1-Champion.stats.cdr);
        }

    },
    R: {
        name: "Massacre",
        rank: 3,
        range: 0,
        cdtimer: 0,
        aoe: true,
        moves: false,
        willCast: function() {
            return this.cdtimer <= 0 && Distance <= this.range && Target.targetable && !Champion.crowdcontrol.cantCast;
        },
        cast: function() {
            Log += "\t" + Champion.data.name + " casts Massacre";

            var basedamage = Champion.data.spells[3].effect[1][this.rank-1];
            var scalingstat = Champion.data.spells[3].vars[0]["link"];
            var scalingdamage = Champion.data.spells[3].vars[0].coeff[0] * Champion.stats[STAT_LINK_MAP[scalingstat][0]] [STAT_LINK_MAP[scalingstat][1]];
            Target.takeDamage(basedamage + scalingdamage, DAMAGE_TYPES.MAGIC, DAMAGE_SOURCE.SKILL);

            Scripts.effects.Massacre.duration = Champion.data.spells[3].effect[0][this.rank - 1];
            Scripts.effects.Massacre.speed = Champion.data.spells[3].effect[2][this.rank - 1] / 100;
            Scripts.effects.Massacre.range = 175;
            Champion.addEffect(Scripts.effects.Massacre);

            this.cdtimer = Champion.data.spells[3].cooldown[this.rank-1]*(1-Champion.stats.cdr);
        }
    },
    effects: {
        DarkFlight: {
            name: "Dark Flight Knockup",
            debuff: true,
            cleansable: false,
            duration: 0,
            apply: function () {
                Log += "\tTarget is knocked up for "+ this.duration +"s\n";
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
                Log += "\t"+ this.name + " expires on Target";
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
                Log += "\tTarget is slowed by " + this.strength + "% for " + this.duration + " seconds\n";
                Target.slows[this.name] = this.strength;
            },
            tick: function () {},
            remove: function () {
                Log += "\t"+ this.name + " expires on Target";
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
            name: "Massacre Buff",
            debuff: false,
            cleansable: false,
            duration: 0,
            speed: 0,
            range: 0,
            apply: function () {
                Log += "\t"+ Champion.data.name +"'s attack speed increased by "+ this.speed +" for "+ this.duration +"s\n";
                Log += "\t"+ Champion.data.name +"'s range increased by "+ this.range +" for "+ this.duration +"s\n";
                Champion.stats.attackspeed.percentbonus += this.speed;
                Champion.stats.attackrange.flatbonus += this.range;
                Champion.calculateStats();
            },
            tick: function () {
            },
            remove: function () {
                Log += "\t"+ this.name + " expires on "+ Champion.data.name +"\n";
                Champion.stats.attackspeed.percentbonus -= this.speed;
                Champion.stats.attackrange.flatbonus -= this.range;
                Champion.calculateStats();
            }
        }
    },
    events: {

    }
};