/**
 * Created by kevinoverall on 8/31/14.
 */
/**
 * Created by kevinoverall on 8/28/14.
 */
var Scripts = {
    load: function() {
        //Set constant attributes, such as manalessness
        Champion.manaless = true;

        //Add Effects, initializing numbers as necessary from the Riot API
        //Initializing numbers should only be necessary if the effect scales with rank/level/etc.
        //Range must be always be initialized here
        Champion.addEffect(this.effects.TwinDisciplines);

        //Add Skills in order of highest casting priority to lowest
        this.W.range = Champion.data.spells[1].range[this.W.rank-1];
        Champion.skills.push(this.W);

        this.Q.range = Champion.data.spells[0].range[this.Q.rank-1];
        Champion.skills.push(this.Q);

        this.R.range = Champion.data.spells[3].range[this.R.rank-1];
        this.effects.ShadowDanceAmmo.charges = Champion.data.spells[3].effect[3][this.R.rank-1];
        Champion.addEffect(this.effects.ShadowDanceAmmo);
        Champion.skills.push(this.R);

        this.E.range = Champion.data.spells[2].range[this.E.rank-1];
        Champion.skills.push(this.E);
    },
    Q: {
        name: "Mark of the Assassin",
        rank: 5,
        range: 0,
        cdtimer: 0,
        casttime: 0.25,
        aoe: false,
        willCast: function() {
            return this.cdtimer <= 0 && Distance <= this.range && Target.targetable && !Champion.crowdcontrol.cantCast
                && !Champion.isAnimating() && Champion.stats.mana.current >= Champion.data.spells[0].cost[this.rank-1]
                && (!Target.stealthed || (Target.stealthed && Target.revealed));

        },
        cast: function() {
            //Apply mana costs
            Champion.stats.mana.current -= Champion.data.spells[0].cost[this.rank-1];
            Log += "\t" + Champion.data.name + " casts " + this.name + " for " + Champion.data.spells[0].cost[this.rank-1] + " energy\n";
            Log += "\t" + Champion.data.name + " has " + Champion.stats.mana.current + " energy left";

            //Calculate and apply damage
            var basedamage = Champion.data.spells[0].effect[4][this.rank-1];
            var scalingstat = Champion.data.spells[0].vars[0]["link"];
            var scalingdamage = Champion.data.spells[0].vars[0].coeff[0] * Champion.stats[STAT_LINK_MAP[scalingstat][0]] [STAT_LINK_MAP[scalingstat][1]];

            var damage = Champion.dealDamage(basedamage + scalingdamage, DAMAGE_TYPES.MAGIC, this);

            Scripts.effects.MarkOfTheAssassin.duration = Champion.data.spells[0].effect[3][this.rank-1];
            basedamage = Champion.data.spells[0].effect[0][this.rank-1];
            scalingdamage = Champion.data.spells[0].vars[1].coeff[0] * Champion.stats[STAT_LINK_MAP[scalingstat][0]] [STAT_LINK_MAP[scalingstat][1]];
            Scripts.events.MarkOfTheAssassin.damage = basedamage + scalingdamage;
            Scripts.events.MarkOfTheAssassin.restore = Champion.data.spells[0].effect[1][this.rank-1];

            Target.addEffect(Scripts.effects.MarkOfTheAssassin);

            //Start Cooldown
            this.cdtimer = Champion.data.spells[0].cooldown[this.rank-1]*(1-Champion.stats.cdr);
        }
    },
    W: {
        name: "Twilight Shroud",
        rank: 5,
        range: 0,
        cdtimer: 0,
        casttime: 0.25,
        aoe: false,
        willCast: function() {
            return this.cdtimer <= 0 && Distance <= this.range && !Champion.crowdcontrol.cantCast
                && !Champion.isAnimating() && Champion.stats.mana.current >= Champion.data.spells[0].cost[this.rank-1];
        },
        cast: function() {
            //Apply mana costs
            Champion.stats.mana.current -= Champion.data.spells[1].cost[this.rank-1];
            Log += "\t" + Champion.data.name + " casts " + this.name + " for " + Champion.data.spells[1].cost[this.rank-1] + " energy";
            Log += "\t" + Champion.data.name + " has " + Champion.stats.mana.current + " energy left";

            Scripts.effects.TwilightShroudStealth.duration = Champion.data.spells[1].effect[0][this.rank-1];
            Champion.addEffect(Scripts.effects.TwilightShroudStealth);

            Scripts.effects.TwilightShroudSlow.duration = Champion.data.spells[1].effect[0][this.rank-1];
            Champion.addEffect(Scripts.effects.TwilightShroudSlow);

            //Start Cooldown
            this.cdtimer = Champion.data.spells[1].cooldown[this.rank-1]*(1-Champion.stats.cdr);
        }
    },
    E: {
        name: "Crescent Slash",
        rank: 5,
        range: 0,
        cdtimer: 0,
        casttime: 0.25,
        aoe: true,
        willCast: function() {
            return this.cdtimer <= 0 && Distance <= this.range && Target.targetable && !Champion.crowdcontrol.cantCast
                && !Champion.isAnimating() && Champion.stats.mana.current >= Champion.data.spells[2].cost[this.rank-1];

        },
        cast: function() {
            //Apply mana costs
            Champion.stats.mana.current -= Champion.data.spells[2].cost[this.rank-1];
            Log += "\t" + Champion.data.name + " casts " + this.name + " for " + Champion.data.spells[2].cost[this.rank-1] + " energy\n";
            Log += "\t" + Champion.data.name + " has " + Champion.stats.mana.current + " energy left";

            //Calculate and apply damage
            var basedamage = Champion.data.spells[2].effect[0][this.rank-1];
            var scalingstat = Champion.data.spells[2].vars[0]["link"];
            var scalingdamage = Champion.data.spells[2].vars[0].coeff[0] * Champion.stats[STAT_LINK_MAP[scalingstat][0]] [STAT_LINK_MAP[scalingstat][1]];
            scalingstat = Champion.data.spells[2].vars[1]["link"];
            scalingdamage += Champion.data.spells[2].vars[1].coeff[0] * Champion.stats[STAT_LINK_MAP[scalingstat][0]] [STAT_LINK_MAP[scalingstat][1]];

            var damage = Champion.dealDamage(basedamage + scalingdamage, DAMAGE_TYPES.PHYSICAL, this);

            //Start Cooldown
            this.cdtimer = Champion.data.spells[2].cooldown[this.rank-1]*(1-Champion.stats.cdr);
        }
    },
    R: {
        name: "Shadow Dance",
        rank: 3,
        range: 0,
        cdtimer: 0,
        casttime: 0.25,
        aoe: false,
        willCast: function() {
            return this.cdtimer <= 0 && Distance <= this.range && Target.targetable && !Champion.crowdcontrol.cantCast && !Champion.crowdcontrol.cantMove
                && !Champion.isAnimating() && Scripts.effects.ShadowDanceAmmo.charges > 0
                && (!Target.stealthed || (Target.stealthed && Target.revealed));

        },
        cast: function() {
            //Apply mana costs
            Log += "\t" + Champion.data.name + " casts " + this.name + "\n";
            Scripts.effects.ShadowDanceAmmo.charges--;
            Log += "\t" + Champion.data.name + " has " + Scripts.effects.ShadowDanceAmmo.charges + " charges left";

            //Calculate and apply damage
            var basedamage = Champion.data.spells[3].effect[0][this.rank-1];
            var scalingstat = Champion.data.spells[3].vars[0]["link"];
            var scalingdamage = Champion.data.spells[3].vars[0].coeff[0] * Champion.stats[STAT_LINK_MAP[scalingstat][0]] [STAT_LINK_MAP[scalingstat][1]];

            var damage = Champion.dealDamage(basedamage + scalingdamage, DAMAGE_TYPES.MAGIC, this);

            //Start Cooldown
            this.cdtimer = Champion.data.spells[3].cooldown[this.rank-1]*(1-Champion.stats.cdr);
        }
    },
    effects: {
        MarkOfTheAssassin: {
            name: "Mark of the Assassin Mark",
            debuff: true,
            cleansable: false,
            duration: 0,
            apply: function () {
                Target.registerEvent(Scripts.events.MarkOfTheAssassin, "postDamageTaken");
            },
            tick: function () {
            },
            remove: function () {
                Target.removeEvent(Scripts.events.MarkOfTheAssassin, "postDamageTaken");
            }
        },
        TwilightShroudStealth: {
            name: "Twilight Shroud Stealth",
            debuff: false,
            cleansable: false,
            duration: 0,
            apply: function () {
                Log += "\t" + Champion.data.name + " is stealthed, resists are increased by " + Champion.data.spells[1].effect[1][Scripts.W.rank-1] + "\n";
                Champion.stealthed = true;
                this.duration = Champion.data.spells[1].effect[0][Scripts.W.rank-1];
                Champion.stats.armor.flatbonus += Champion.data.spells[1].effect[1][Scripts.W.rank-1];
                Champion.stats.magicresistance.flatbonus += Champion.data.spells[1].effect[1][Scripts.W.rank-1];

                Champion.registerEvent(Scripts.events.TwilightShroudReveal, "autoAttack");
                Champion.registerEvent(Scripts.events.TwilightShroudReveal, "spellCast");
            },
            tick: function () {
                Champion.stealthed = true;
            },
            remove: function () {
                Log += "\tTwilight Shroud expires on " + Champion.data.name + "\n";

                Champion.stealthed = false;
                Champion.stats.armor.flatbonus -= Champion.data.spells[1].effect[1][Scripts.W.rank-1];
                Champion.stats.magicresistance.flatbonus -= Champion.data.spells[1].effect[1][Scripts.W.rank-1];

                Champion.removeEffect(Scripts.effects.TwilightShroudReveal);
                Champion.removeEvent(Scripts.events.TwilightShroudReveal, "autoAttack");
                Champion.removeEvent(Scripts.events.TwilightShroudReveal, "spellCast");
            }
        },
        TwilightShroudReveal: {
            name: "Twilight Shroud Reveal",
            debuff: false,
            cleansable: false,
            duration: 0,
            apply: function () {
                Log += "\t" + Champion.data.name + " is revealed\n";
                Champion.revealed = true;
            },
            tick: function () {
                Champion.revealed = true;
            },
            remove: function () {
                Log += "\t" + Champion.data.name + " is stealthed\n";
                Champion.revealed = false;
            }
        },
        TwilightShroudSlow: {
            name: "Twilight Shroud Slow",
            debuff: true,
            cleansable: true,
            duration: 0,
            apply: function () {
                Log += "\tTarget is slowed by " + Champion.data.spells[1].effect[2][Scripts.W.rank-1] * (1 - Target.stats.slowresist) + "% for " + this.duration + " seconds\n";
                Target.slows[this.name] = Champion.data.spells[1].effect[2][Scripts.W.rank-1] * (1 - Target.stats.slowresist);
            },
            tick: function () {
                Target.slows[this.name] = Champion.data.spells[1].effect[2][Scripts.W.rank-1] * (1 - Target.stats.slowresist);
            },
            remove: function () {
                Log += "\t"+ this.name + " expires on Target";
                delete Target.slows[this.name];
            }
        },
        ShadowDanceAmmo: {
            name: "Essence of Shadow",
            debuff: false,
            cleansable: false,
            duration: 10000,
            charges: 0,
            cdtimer: 0,
            apply: function () {
            },
            tick: function () {
                if (this.charges < Champion.data.spells[2].effect[1][Scripts.R.rank-1]) {
                    if (this.cdtimer <= 0) {
                        this.charges++;
                        this.cdtimer = Champion.data.spells[2].effect[2][Scripts.R.rank-1] * (1 - Champion.stats.cdr);
                    } else {
                        this.cdtimer -= TIME_STEP;
                    }
                }
            },
            remove: function () {
            }
        },
        TwinDisciplines: {
            name: "Twin Disciplines",
            debuff: false,
            cleansable: false,
            duration: 10000,
            spellvamp: 0,
            apply: function () {
                Champion.registerEvent(Scripts.events.TwinDisciplines, "autoAttack");
                this.spellvamp = 0.06 + 0.01 * (Champion.stats.attackdamage.bonus / 6);
                Champion.stats.spellvamp += this.spellvamp;
            },
            tick: function () {
                Champion.stats.spellvamp += 0.06 + 0.01 * (Champion.stats.attackdamage.bonus / 6) - this.spellvamp;
                this.spellvamp = 0.06 + 0.01 * (Champion.stats.attackdamage.bonus / 6);
            },
            remove: function () {
                Champion.removeEvent(Scripts.events.TwinDisciplines, "autoAttack");
                Champion.stats.spellvamp -= this.spellvamp;
            }
        }
    },
    events: {
        MarkOfTheAssassin: {
            name: "Mark of the Assassin",
            damage: 0,
            restore: 0,
            triggerEvent: function (arguments) {
                if(arguments[2] == "autoattack" || arguments[2].name == "Crescent Slash") {
                    Log += "\t" + Champion.data.name + " procs " + this.name + ", restoring " + this.restore + " energy\n";
                    Champion.dealDamage(this.damage, DAMAGE_TYPES.MAGIC, Scripts.Q);
                    Champion.stats.mana.current = Math.min(Champion.stats.mana.total, Champion.stats.mana.current + this.restore);
                    Target.removeEffect(Scripts.effects.MarkOfTheAssassin);
                }
            }
        },
        TwilightShroudReveal: {
            name: "Twilight Shroud Reveal",
            triggerEvent: function (arguments) {
                Log += "\t" + Champion.data.name + " is revealed for 0.65s\n";
                Scripts.effects.TwilightShroudReveal.duration = 0.65;
                Champion.addEffect(Scripts.effects.TwilightShroudReveal);
            }
        },
        TwinDisciplines: {
            name: "Twin Disciplines On Hit",
            triggerEvent: function (arguments) {
                Log += "\t" + Champion.data.name + " procs Twin Disciplines\n";

                var damage = 0.06 + 0.01 * (Champion.stats.abilitypower.current / 6);
                damage *= Champion.stats.attackdamage.current;
                damage = Champion.dealDamage(damage, DAMAGE_TYPES.MAGIC, null);


            }
        }
    }
};