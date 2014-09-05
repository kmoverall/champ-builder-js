/**
 * Created by kevinoverall on 6/30/14.
 */
var Scripts = {
    load: function() {

        Champion.manaless = true;

        Champion.addEffect(this.effects.BloodWell);

        this.Q.range = Champion.data.spells[0].range[this.Q.rank-1];
        Champion.skills.push(this.Q);

        this.R.range = Champion.data.spells[3].range[this.R.rank-1];
        Champion.skills.push(this.R);

        this.E.range = Champion.data.spells[2].range[this.E.rank-1];
        Champion.skills.push(this.E);

        //Champion.skills.push(this.W);
        //Initialize Blood Thirst Numbers
        var baseheal = Champion.data.spells[1].effect[3][this.W.rank-1];
        var scalingstat = Champion.data.spells[1].vars[0]["link"];
        var scalingheal = Champion.data.spells[1].vars[0].coeff[0] * Champion.stats[STAT_LINK_MAP[scalingstat][0]] [STAT_LINK_MAP[scalingstat][1]];
        this.events.BloodThirst.strength = baseheal + scalingheal;
        this.events.BloodThirst.boost = (100 + Champion.data.spells[1].effect[1][this.W.rank-1]) / 100;
        Champion.addEffect(this.effects.BloodThirst);
        Champion.skills.push(this.W);

    },
    Q: {
        name: "Dark Flight",
        rank: 5,
        range: 0,
        cdtimer: 0,
        casttime: 0.25,
        aoe: true,
        willCast: function() {
            return this.cdtimer <= 0 && Distance <= this.range && Target.targetable && !Champion.crowdcontrol.cantCast && !Champion.crowdcontrol.cantMove && !Champion.isAnimating();
        },
        cast: function() {

            //Apply health cost
            var cost = Champion.stats.health.current * (Champion.data.spells[0].effect[3][this.rank-1] / 100);
            Champion.stats.health.current -= cost;
            //Store in the blood well
            Champion.stats.mana.current = Math.min(Champion.stats.mana.current + cost, Champion.stats.mana.total);

            Log += "\t" + Champion.data.name + " casts Dark Flight for " + cost + " health";

            //Close the gap
            Distance = Math.max(Distance - this.range, 0);

            //Calculate and apply damage
            var basedamage = Champion.data.spells[0].effect[1][this.rank-1];
            var scalingstat = Champion.data.spells[0].vars[0]["link"];
            var scalingdamage = Champion.data.spells[0].vars[0].coeff[0] * Champion.stats[STAT_LINK_MAP[scalingstat][0]] [STAT_LINK_MAP[scalingstat][1]];
            var damage = Champion.dealDamage(basedamage + scalingdamage, DAMAGE_TYPES.PHYSICAL, this);

            //Apply CC
            Scripts.effects.DarkFlight.duration = Champion.data.spells[0].effect[5][this.rank-1];
            Target.addEffect(Scripts.effects.DarkFlight);

            //Start Cooldown
            this.cdtimer = Champion.data.spells[0].cooldown[this.rank-1]*(1-Champion.stats.cdr);
        }
    },
    W: {
        name: "Blood Thirst/Blood Price",
        rank: 5,
        range: 0,
        cdtimer: 0,
        casttime: 0,
        aoe: true,
        toggledOn: false,
        willCast: function() {
            var basedamage = Champion.data.spells[1].effect[2][this.rank-1];
            var scalingstatdamage = Champion.data.spells[1].vars[1]["link"];
            var scalingdamage = Champion.data.spells[1].vars[1].coeff[0] * Champion.stats[STAT_LINK_MAP[scalingstatdamage][0]] [STAT_LINK_MAP[scalingstatdamage][1]];

            var baseheal = Champion.data.spells[1].effect[3][this.rank-1];
            var scalingstatheal = Champion.data.spells[1].vars[0]["link"];
            var scalingheal = Champion.data.spells[1].vars[0].coeff[0] * Champion.stats[STAT_LINK_MAP[scalingstatheal][0]] [STAT_LINK_MAP[scalingstatheal][1]];

            var pcntdmg;
            var pcntheal;

            //Will only switch to blood price if damage dealt as percentage of target's health is greater than amount healed as percentage of Aatrox's health and vice versa
            pcntdmg = (basedamage + scalingdamage);
            pcntdmg *= 100 / (100 + Target.stats.armor.current * (1 - Champion.stats.armorpenetration.percent) - Champion.stats.armorpenetration.flat);
            pcntdmg /= Target.stats.health.total;
            pcntdmg -= ((basedamage + scalingdamage) / 4) / Champion.stats.health.total;

            pcntheal = (baseheal + scalingheal) / Champion.stats.health.total;

            if (Champion.stats.health.current < Champion.stats.health.total / 2) {
                pcntheal *= (100 + Champion.data.spells[1].effect[1][this.rank-1]) / 100;
            }
            //It toggles if damage would be greater than healing and skill is toggled off
            //OR if damage would be less than healing and skill is toggled on
            return this.cdtimer <= 0 && !Champion.crowdcontrol.cantCast && ((pcntdmg > pcntheal && !this.toggledOn) || (pcntdmg < pcntheal && this.toggledOn));
        },
        cast: function() {
            this.toggledOn = !this.toggledOn;
            if (this.toggledOn) {
                var basedamage = Champion.data.spells[1].effect[2][this.rank-1];
                var scalingstatdamage = Champion.data.spells[1].vars[1]["link"];
                var scalingdamage = Champion.data.spells[1].vars[1].coeff[0] * Champion.stats[STAT_LINK_MAP[scalingstatdamage][0]] [STAT_LINK_MAP[scalingstatdamage][1]];
                Scripts.events.BloodPrice.strength = basedamage + scalingdamage;
                Scripts.events.BloodPrice.cost = (basedamage + scalingdamage) / 4;

                Champion.removeEffect(Scripts.effects.BloodThirst);
                Champion.addEffect(Scripts.effects.BloodPrice);
            } else {
                var baseheal = Champion.data.spells[1].effect[3][this.rank-1];
                var scalingstatheal = Champion.data.spells[1].vars[0]["link"];
                var scalingheal = Champion.data.spells[1].vars[0].coeff[0] * Champion.stats[STAT_LINK_MAP[scalingstatheal][0]] [STAT_LINK_MAP[scalingstatheal][1]];

                Scripts.events.BloodThirst.strength = baseheal + scalingheal;
                Scripts.events.BloodThirst.boost = (100 + Champion.data.spells[1].effect[1][this.rank-1]) / 100;

                Champion.removeEffect(Scripts.effects.BloodPrice);
                Champion.addEffect(Scripts.effects.BloodThirst);
            }
            this.cdtimer = Champion.data.spells[1].cooldown[this.rank-1]*(1-Champion.stats.cdr);
        }
    },
    E: {
        name: "Blades of Torment",
        rank: 5,
        range: 0,
        cdtimer: 0,
        casttime: 0.25,
        aoe: true,
        willCast: function() {
            return this.cdtimer <= 0 && Distance <= this.range && Target.targetable && !Champion.crowdcontrol.cantCast && !Champion.isAnimating();
        },
        cast: function() {
            //Apply health cost
            var cost = Champion.stats.health.current * (Champion.data.spells[2].effect[5][this.rank-1] / 100);
            Champion.stats.health.current -= cost;
            //Store in the blood well
            Champion.stats.mana.current = Math.min(Champion.stats.mana.current + cost, Champion.stats.mana.total);

            Log += "\t" + Champion.data.name + " casts Blades of Torment for " + cost + " health";

            //Calculate and apply damage
            var basedamage = Champion.data.spells[2].effect[1][this.rank-1];
            var scalingstat = [];
            scalingstat[0] = Champion.data.spells[2].vars[0]["link"];
            scalingstat[1] = Champion.data.spells[2].vars[1]["link"];
            var scalingdamage = Champion.data.spells[2].vars[0].coeff[0] * Champion.stats[STAT_LINK_MAP[scalingstat[0]][0]] [STAT_LINK_MAP[scalingstat[0]][1]];
            scalingdamage += Champion.data.spells[2].vars[1].coeff[0] * Champion.stats[STAT_LINK_MAP[scalingstat[1]][0]] [STAT_LINK_MAP[scalingstat[1]][1]];
            var damage = Champion.dealDamage(basedamage + scalingdamage, DAMAGE_TYPES.MAGIC, this);

            //Apply CC
            Scripts.effects.BladesOfTorment.duration = Champion.data.spells[2].effect[4][this.rank - 1] * (1-Champion.stats.tenacity);
            Scripts.effects.BladesOfTorment.strength = Champion.data.spells[2].effect[2][this.rank - 1] * (1-Champion.stats.slowresist);
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
        casttime: 0.25,
        aoe: true,
        willCast: function() {
            return this.cdtimer <= 0 && Distance <= this.range && Target.targetable && !Champion.crowdcontrol.cantCast && !Champion.isAnimating();
        },
        cast: function() {
            Log += "\t" + Champion.data.name + " casts Massacre";

            var basedamage = Champion.data.spells[3].effect[2][this.rank-1];
            var scalingstat = Champion.data.spells[3].vars[0]["link"];
            var scalingdamage = Champion.data.spells[3].vars[0].coeff[0] * Champion.stats[STAT_LINK_MAP[scalingstat][0]] [STAT_LINK_MAP[scalingstat][1]];
            var damage = Champion.dealDamage(basedamage + scalingdamage, DAMAGE_TYPES.MAGIC, this);

            Scripts.effects.Massacre.duration = Champion.data.spells[3].effect[1][this.rank - 1];
            Scripts.effects.Massacre.speed = Champion.data.spells[3].effect[3][this.rank - 1] / 100;
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
                delete Target.slows[this.name];
            }
        },
        BloodWell: {
            name: "Blood Well",
            debuff: false,
            cleansable: false,
            duration: 1000000,
            asbase: 0,
            asboost: 0,
            cdtimer: 0,
            apply: function () {
                this.asbase = 0.006 + Math.floor((Champion.stats.level - 1) / 3) * 0.001;
                this.asboost = this.asbase * (Champion.stats.mana.current / Champion.stats.mana.total) * 50;
                Champion.stats.attackspeed.percentbonus += this.asboost;
                Champion.registerEvent(Scripts.events.BloodWell, "postDamageTaken");
            },
            tick: function () {
                //Recalculate and store attack speed buff
                var newboost = this.asbase * (Champion.stats.mana.current / Champion.stats.mana.total) * 50;
                Champion.stats.attackspeed.percentbonus += newboost - this.asboost;
                this.asboost = newboost;

                //If blood well is on cooldown, countdown until the revive event can be re-registered
                if (this.cdtimer > 0) {
                    this.cdtimer -= TIME_STEP;
                    if(this.cdtimer <= 0) {
                        Champion.registerEvent(Scripts.events.BloodWell, "postDamageTaken");
                    }
                }
            },
            remove: function () {
                Champion.stats.attackspeed.percentbonus -= this.asboost;
                Champion.removeEvent(Scripts.events.BloodWell, "postDamageTaken");
            }
        },
        BloodWellRevive: {
            name: "Blood Well Resurrection",
            debuff: false,
            cleansable: false,
            duration: 3,
            healamount: 0,
            apply: function () {
                //Cleanse Debuffs
                for(var effect in Champion.effects) {
                    if (Champion.effects.hasOwnProperty(effect) && Champion.effects[effect].debuff) {
                        Champion.effects[effect].remove();
                    }
                }
                Champion.animation.timeleft = null;
                Champion.animation.action = null;
                Champion.crowdcontrol.cantMove = true;
                Champion.crowdcontrol.cantAttack = true;
                Champion.crowdcontrol.cantCast = true;
                Champion.targetable = false;
                this.healamount = Champion.stats.mana.current;
                Champion.removeEvent(Scripts.events.BloodWell, "postDamageTaken");
            },
            tick: function () {
                //Ensure that Aatrox cannot attack move or cast during revive
                Champion.animation.timeleft = null;
                Champion.animation.action = null;
                Champion.crowdcontrol.cantMove = true;
                Champion.crowdcontrol.cantAttack = true;
                Champion.crowdcontrol.cantCast = true;
                Champion.targetable = false;

                if(this.duration % 0.25 < (this.duration - TIME_STEP)% 0.25) {
                    Champion.heal((10.5 + 15.75*Champion.stats.level + this.healamount) / 12);
                    Champion.stats.mana.current -= this.healamount / 12;
                }
            },
            remove: function () {
                Log += "\t"+ Champion.data.name +" comes out of Blood Well\n";
                Champion.crowdcontrol.cantMove = false;
                Champion.crowdcontrol.cantAttack = false;
                Champion.crowdcontrol.cantCast = false;
                Champion.targetable = true;
                Scripts.effects.BloodWell.cdtimer = 225;
            }
        },
        BloodThirst: {
            name: "Blood Thirst",
            debuff: false,
            cleansable: false,
            duration: 1000000,
            apply: function () {
                Scripts.events.BloodPrice.stacks = Scripts.events.BloodThirst.stacks;
                Log += "\t"+ Champion.data.name +" switches to Blood Thirst\n";
                Champion.registerEvent(Scripts.events.BloodThirst, "autoAttack");
            },
            tick: function () {
            },
            remove: function () {
                Log += "\t"+ Champion.data.name +" loses Blood Thirst\n";
                Champion.removeEvent(Scripts.events.BloodThirst, "autoAttack");
            }
        },
        BloodPrice: {
            name: "Blood Price",
            debuff: false,
            cleansable: false,
            duration: 1000000,
            apply: function () {
                Scripts.events.BloodPrice.stacks = Scripts.events.BloodThirst.stacks;
                Log += "\t"+ Champion.data.name +" switches to Blood Price\n";
                Champion.registerEvent(Scripts.events.BloodPrice, "autoAttack");
            },
            tick: function () {
            },
            remove: function () {
                Log += "\t"+ Champion.data.name +" loses Blood Price\n";
                Champion.removeEvent(Scripts.events.BloodPrice, "autoAttack");
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
        BloodThirst: {
            name: "Blood Thirst On Hit",
            stacks: 0,
            strength: 0,
            boost: 0,
            triggerEvent: function (arguments) {
                if(this.stacks == 2) {
                    Log += "\t"+ Champion.data.name +" procs Blood Thirst\n";
                    this.stacks = 0;
                    if (Champion.stats.health.current < Champion.stats.health.total * 0.5) {
                        Champion.heal(this.strength * this.boost)
                    } else {
                        Champion.heal(this.strength);
                    }
                } else {
                    this.stacks++;
                }
            }
        },
        BloodPrice: {
            name: "Blood Price On Hit",
            stacks: 0,
            strength: 0,
            cost: 0,
            triggerEvent: function (arguments) {
                if(this.stacks == 2) {
                    Log += "\t"+ Champion.data.name +" procs Blood Price for "+this.cost+" health\n";
                    if (Champion.stats.health.current > this.cost) {
                        this.stacks = 0;
                        Champion.dealDamage(this.strength, DAMAGE_TYPES.PHYSICAL, null);
                        Champion.stats.health.current -= this.cost;

                        //Store in the blood well
                        Champion.stats.mana.current = Math.min(Champion.stats.mana.current + this.cost, Champion.stats.mana.total);
                    }
                } else {
                    this.stacks++;
                }
            }
        },
        BloodWell: {
            name: "Blood Well Revive",
            cdtimer: 0,
            triggerEvent: function (arguments) {
                if(Champion.stats.health.current <= 0) {
                    Log += "\t"+ Champion.data.name +" activates Blood Well\n";
                    Champion.stats.health.current += arguments[0];
                    Champion.addEffect(Scripts.effects.BloodWellRevive);
                    Champion.removeEvent(this, "postDamageTaken");
                }
            }
        }
    }
};