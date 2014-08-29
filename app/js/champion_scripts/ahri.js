/**
 * Created by kevinoverall on 8/28/14.
 */
var Scripts = {
    load: function() {
        //Set constant attributes, such as manalessness

        //Add Effects, initializing numbers as necessary from the Riot API
        //Initializing numbers should only be necessary if the effect scales with rank/level/etc.
        //Range must be always be initialized here
        this.E.range = Champion.data.spells[2].range[this.E.rank-1];
        Champion.skills.push(this.E);

        this.R.range = Champion.data.spells[3].range[this.R.rank-1] + 450;
        this.R.charges = 3;
        Champion.skills.push(this.R);

        this.Q.range = Champion.data.spells[0].range[this.Q.rank-1];
        Champion.skills.push(this.Q);

        Champion.skills.push(this.W);

        //Add Skills in order of highest casting priority to lowest
        //TODO: Add a Champion.dealDamage function so that dealtDamage events can be called
    },
    Q: {
        name: "Orb of Deception",
        rank: 5,
        range: 880,
        cdtimer: 0,
        casttime: 0.25,
        aoe: true,
        willCast: function() {
            return this.cdtimer <= 0 && Distance <= this.range && Target.targetable && !Champion.crowdcontrol.cantCast
                && !Champion.isAnimating() && Champion.stats.mana.current >= Champion.data.spells[0].cost[this.rank-1];
        },
        cast: function() {

            //Apply mana costs
            Champion.stats.mana.current -= Champion.data.spells[0].cost[this.rank-1];
            Log += "\t" + Champion.data.name + " casts " + this.name + " for " + Champion.data.spells[0].cost[this.rank-1] + " mana";

            //Calculate and apply damage
            var basedamage = Champion.data.spells[0].effect[0][this.rank-1];
            var scalingstat = Champion.data.spells[0].vars[0]["link"];
            var scalingdamage = Champion.data.spells[0].vars[0].coeff[0] * Champion.stats[STAT_LINK_MAP[scalingstat][0]] [STAT_LINK_MAP[scalingstat][1]];
            var damage = Target.takeDamage(basedamage + scalingdamage, DAMAGE_TYPES.MAGIC, DAMAGE_SOURCE.SKILL);
            var truedmg = basedamage + scalingdamage;
            if("Charm" in Target.effects) {
                truedmg *= 1.2;
            }
            damage += Target.takeDamage(truedmg, DAMAGE_TYPES.TRUE, DAMAGE_SOURCE.SKILL);
            Champion.heal(damage * (1/3) * Champion.stats.spellvamp);

            //Start Cooldown
            this.cdtimer = Champion.data.spells[0].cooldown[this.rank-1]*(1-Champion.stats.cdr);
        }
    },
    W: {
        name: "Fox-Fire",
        rank: 5,
        range: 0,
        cdtimer: 0,
        casttime: 0,
        aoe: true,
        willCast: function() {
            return this.cdtimer <= 0 && !Champion.crowdcontrol.cantCast && Scripts.E.cdtimer > 1
                && Champion.stats.mana.current >= Champion.data.spells[1].cost[this.rank-1];
        },
        cast: function() {
            //Apply mana costs
            Champion.stats.mana.current -= Champion.data.spells[1].cost[this.rank-1];
            Log += "\t" + Champion.data.name + " casts " + this.name + " for " + Champion.data.spells[1].cost[this.rank-1] + " mana";

            //Calculate damage
            var basedamage = Champion.data.spells[1].effect[0][this.rank-1];
            var scalingstat = Champion.data.spells[1].vars[0]["link"];
            var scalingdamage = Champion.data.spells[1].vars[0].coeff[0] * Champion.stats[STAT_LINK_MAP[scalingstat][0]] [STAT_LINK_MAP[scalingstat][1]];
            Scripts.effects.FoxFire.initialdamage = basedamage + scalingdamage;

            basedamage = Champion.data.spells[1].effect[1][this.rank-1];
            var reductionratio = basedamage / Champion.data.spells[1].effect[0][this.rank-1];
            scalingdamage = Champion.data.spells[1].vars[0].coeff[0] * Champion.stats[STAT_LINK_MAP[scalingstat][0]] [STAT_LINK_MAP[scalingstat][1]];
            Scripts.effects.FoxFire.furtherdamage = basedamage + scalingdamage * reductionratio;

            //Setup Fox-Fire effect
            Scripts.effects.FoxFire.range = Champion.data.spells[1].range[this.rank-1];
            Scripts.effects.FoxFire.cooldown = Champion.data.spells[1].cooldown[this.rank-1]*(1-Champion.stats.cdr);

            //Skill actually goes on CD after damage is applied. CD is set so that it will not run out before then
            this.cdtimer = 10000;

            Champion.addEffect(Scripts.effects.FoxFire);
        }
    },
    E: {
        name: "Charm",
        rank: 5,
        range: 0,
        cdtimer: 0,
        casttime: 0.25,
        aoe: false,
        willCast: function() {
            return this.cdtimer <= 0 && Distance <= this.range && Target.targetable && !Champion.crowdcontrol.cantCast
                && !Champion.isAnimating() && Champion.stats.mana.current >= Champion.data.spells[2].cost[this.rank-1];
        },
        cast: function() {

            //Apply mana costs
            Champion.stats.mana.current -= Champion.data.spells[2].cost[this.rank-1];
            Log += "\t" + Champion.data.name + " casts " + this.name + " for " + Champion.data.spells[2].cost[this.rank-1] + " mana";

            //Calculate and apply damage
            var basedamage = Champion.data.spells[2].effect[0][this.rank-1];
            var scalingstat = Champion.data.spells[2].vars[0]["link"];
            var scalingdamage = Champion.data.spells[2].vars[0].coeff[0] * Champion.stats[STAT_LINK_MAP[scalingstat][0]] [STAT_LINK_MAP[scalingstat][1]];
            var damage = Target.takeDamage(basedamage + scalingdamage, DAMAGE_TYPES.MAGIC, DAMAGE_SOURCE.SKILL);
            Champion.heal(damage * Champion.stats.spellvamp);

            //Apply Effects
            Scripts.effects.Charm.duration = Champion.data.spells[2].effect[1][this.rank-1] * (1-Target.stats.tenacity);
            Target.addEffect(Scripts.effects.Charm);

            //Start Cooldown
            this.cdtimer = Champion.data.spells[2].cooldown[this.rank-1]*(1-Champion.stats.cdr);
        }
    },
    R: {
        name: "Spirit Rush",
        rank: 3,
        range: 0,
        cdtimer: 0,
        casttime: 0.1,
        aoe: true,
        charges: 0,
        willCast: function() {
            return this.cdtimer <= 0 && Distance <= this.range && Target.targetable && !Champion.crowdcontrol.cantCast
                && !Champion.isAnimating() && Champion.stats.mana.current >= Champion.data.spells[3].cost[this.rank-1];
        },
        cast: function() {
            //Apply mana costs
            if (this.charges == 3) {
                Champion.stats.mana.current -= Champion.data.spells[2].cost[this.rank - 1];
                Log += "\t" + Champion.data.name + " casts " + this.name + " for " + Champion.data.spells[3].cost[this.rank - 1] + " mana";

                Scripts.effects.SpiritRush.duration = 10;
                Scripts.effects.SpiritRush.ultcooldown = Champion.data.spells[3].cooldown[this.rank-1]*(1-Champion.stats.cdr);
                Champion.addEffect(Scripts.effects.SpiritRush);
            }

            this.charges -= 1;

            //Calculate and apply damage
            var basedamage = Champion.data.spells[3].effect[0][this.rank-1];
            var scalingstat = Champion.data.spells[3].vars[0]["link"];
            var scalingdamage = Champion.data.spells[3].vars[0].coeff[0] * Champion.stats[STAT_LINK_MAP[scalingstat][0]] [STAT_LINK_MAP[scalingstat][1]];
            var damage = Target.takeDamage(basedamage + scalingdamage, DAMAGE_TYPES.MAGIC, DAMAGE_SOURCE.SKILL);
            Champion.heal(damage * (1/3) * Champion.stats.spellvamp);

            if (this.charges > 0) {
                this.cdtimer = 0.5;
            } else {
                //Removing this effect will also put Spirit Rush on its full cooldown
                Champion.removeEffect(Scripts.effects.SpiritRush);
            }
        }
    },
    effects: {
        FoxFire: {
            name: "Fox-Fire",
            debuff: false,
            cleansable: false,
            duration: 0,
            delaytime: 4.75,
            initialdamage: 0,
            furtherdamage: 0,
            range: 0,
            cooldown: 0,
            apply: function () {
                this.duration = 5;
            },
            tick: function () {
                if (this.duration <= this.delaytime && Distance < this.range) {
                    var damage = Target.takeDamage(this.initialdamage, DAMAGE_TYPES.MAGIC, DAMAGE_SOURCE.SKILL);
                    Champion.heal(damage * Champion.stats.spellvamp);

                    damage = Target.takeDamage(this.furtherdamage, DAMAGE_TYPES.MAGIC, DAMAGE_SOURCE.SKILL);
                    Champion.heal(damage * Champion.stats.spellvamp);

                    damage = Target.takeDamage(this.furtherdamage, DAMAGE_TYPES.MAGIC, DAMAGE_SOURCE.SKILL);
                    Champion.heal(damage * Champion.stats.spellvamp);

                    Scripts.W.cdtimer = this.cooldown;
                    Champion.removeEffect(this);
                }
            },
            remove: function () {
                Scripts.W.cdtimer = this.cooldown;
            }
        },
        Charm: {
            name: "Charm",
            debuff: true,
            cleansable: true,
            duration: 0,
            apply: function () {
                Log += "\tTarget is charmed for "+ this.duration +"s\n";
                Target.crowdcontrol.cantMove = true;
                Target.crowdcontrol.cantCast = true;
                Target.crowdcontrol.cantAttack = true;
                Target.stats.damagereduction.magic.percent *= 1.2;
            },
            tick: function () {
                Target.crowdcontrol.cantMove = true;
                Target.crowdcontrol.cantCast = true;
                Target.crowdcontrol.cantAttack = true;
            },
            remove: function () {
                Log += "\tTarget is no longer charmed\n";
                Target.crowdcontrol.cantMove = false;
                Target.crowdcontrol.cantCast = false;
                Target.crowdcontrol.cantAttack = false;
                Target.stats.damagereduction.magic.percent /= 1.2;
            }
        },
        SpiritRush: {
            name: "Spirit Rush Timer",
            debuff: false,
            cleansable: false,
            duration: 0,
            ultcooldown: 0,
            apply: function () {
            },
            tick: function () {
            },
            remove: function () {
                Scripts.R.cdtimer = this.ultcooldown;
                Scripts.R.charges = 0;
            }
        }
    },
    events: {
        EssenceTheft: {
            name: "Essence Theft",
            triggerEvent: function (arguments) {

            }
        }
    }
};