/**
 * Created by kevinoverall on 5/15/14.
 */
var Target = {
    stats: {
        level: 18,
        health: {
            base: 0,
            perlevel: 0,
            flatbonus: 0,
            percentbonus: 0,
            bonus: 0,
            current: 0,
            total: 0
        },
        healthregen: {
            base: 0,
            perlevel: 0,
            flatbonus: 0,
            percentbonus: 0,
            current: 0
        },
        mana: {
            base: 0,
            perlevel: 0,
            flatbonus: 0,
            percentbonus: 0,
            current: 0,
            total: 0
        },
        manaregen: {
            base: 0,
            perlevel: 0,
            flatbonus: 0,
            percentbonus: 0,
            current: 0
        },
        attackdamage: {
            base: 0,
            perlevel: 0,
            flatbonus: 0,
            percentbonus: 0,
            bonus: 0,
            current: 0
        },
        attackspeed: {
            base: 0,
            perlevel: 0,
            percentbonus: 0,
            current: 0
        },
        attackrange: {
            base: 0,
            flatbonus: 0,
            current: 0
        },
        armor: {
            base: 0,
            perlevel: 0,
            flatbonus: 0,
            percentbonus: 0,
            bonus: 0,
            current: 0
        },
        magicresistance: {
            base: 0,
            perlevel: 0,
            flatbonus: 0,
            percentbonus: 0,
            bonus: 0,
            current: 0
        },
        movementspeed: {
            base: 0,
            perlevel: 0,
            flatbonus: 0,
            percentbonus: 0,
            multpercentbonus: 0,
            beforeslows: 0,
            current: 0
        },
        tenacity: 0,
        slowresist: 0,
        armorpenetration: {
            flat: 0,
            percent: 0
        },
        abilitypower: {
            base: 0,
            perlevel: 0,
            flatbonus: 0,
            percentbonus: 0,
            current: 0
        },
        magicpenetration: {
            flat: 0,
            percent: 0
        },
        lifesteal: 0,
        spellvamp: 0,
        cdr: 0,
        critical: {
            chance: 0,
            damage: 2
        },
        //Describes damage reductions outside of resistances
        damagereduction: {
            auto: {
                flat: 0,
                percent: 1
            },
            physical: {
                flat: 0,
                percent: 1
            },
            magic: {
                flat: 0,
                percent: 1
            }
        }
    },
    skills: {},
    effects: {},
    events: {
        preDamageTaken: {},
        postDamageTaken: {},
        preDamageDealt: {},
        postDamageDealt: {},
        autoAttack: {},
        enemyAutoAttack: {},
        spellCast: {},
        enemySpellCast: {}
    },
    //Crowd control is listed by restricted actions as the key and duration as the value
    slows: {},
    crowdcontrol: {
        cantMove: 0,
        cantAttack: 0,
        cantCast: 0

    },
    shield: {
        standard: 0,
        physical: 0,
        magic: 0
    },
    stealthed: false,
    revealed: false,
    healingeffect: 1,
    targetable: true,
    attacktimer: 0,
    animation: {
        timeleft: null,
        action: null
    },

    dealDamage: function(damage, type, source) {
        this.processEvents("preDamageDealt", [damage, type, source]);
        damage = Champion.takeDamage(damage, type, source);
        this.processEvents("postDamageDealt", [damage, type, source]);

        if(source === "autoattack") {
            this.heal(damage * this.stats.lifesteal);
        } else if (source !== null) {
            if (source.aoe) {
                this.heal(damage * this.stats.spellvamp * (1/3));
            } else {
                this.heal(damage * this.stats.spellvamp);
            }
        }

        return damage;
    },

    takeDamage: function(damage, type, source) {
        this.processEvents("preDamageTaken", [damage, type, source]);

        //Reduces damage taken based on source and damage type
        switch(type) {
            case DAMAGE_TYPES.PHYSICAL:
                //apply armor
                effective_armor = this.stats.armor.current * (1 - Target.stats.armorpenetration.percent) - Target.stats.armorpenetration.flat;
                if (effective_armor >= 0) {
                    damage *= 100 / (100 + effective_armor);
                }
                else {
                    damage *= 2 - 100 / (100 - effective_armor)
                }

                //apply non-resistance damage reduction/amplification
                if(source === "autoattack") {
                    damage = damage * (this.stats.damagereduction.auto.percent) * (this.stats.damagereduction.physical.percent);
                    damage = damage - this.stats.damagereduction.auto.flat - this.stats.damagereduction.physical.flat;

                }
                else {
                    damage *= this.stats.damagereduction.physical.percent;
                    damage -= this.stats.damagereduction.physical.flat;
                }

                Log += "\tTarget takes " + damage + " physical damage\n";
                break;

            case DAMAGE_TYPES.MAGIC:
                //apply magic resistance
                effective_mr = this.stats.magicresistance.current * (1 - Target.stats.magicpenetration.percent) - Target.stats.magicpenetration.flat;
                if (effective_mr >= 0) {
                    damage *= 100 / (100 + effective_mr);
                }
                else {
                    damage *= 2 - 100 / (100 - effective_mr)
                }

                //apply non-resistance damage reduction/amplification
                damage *= this.stats.damagereduction.magic.percent;
                damage -= this.stats.damagereduction.magic.flat;

                Log += "\tTarget takes " + damage + " magic damage\n";
                break;

            case DAMAGE_TYPES.TRUE:
                Log += "\tTarget takes " + damage + " true damage\n";
                break;
        }

        //Apply damage to shields
        var remaining_damage = damage;
        if (type == DAMAGE_TYPES.PHYSICAL) {
            if (remaining_damage > this.shield.physical) {
                remaining_damage -= this.shield.physical;
                this.shield.physical = 0;
            } else {
                remaining_damage = 0;
                this.shield.physical -= damage;
            }
        } else if (type == DAMAGE_TYPES.MAGIC) {
            if (remaining_damage > this.shield.magic) {
                remaining_damage -= this.shield.magic;
                this.shield.magic = 0;
            } else {
                remaining_damage = 0;
                this.shield.magic -= damage;
            }
        }

        if (remaining_damage > this.shield.standard) {
            remaining_damage -= this.shield.standard;
            this.shield.standard = 0;
        } else {
            this.shield.standard -= remaining_damage;
            remaining_damage = 0;
        }

        //Apply damage to current health
        this.stats.health.current -= remaining_damage;

        this.processEvents("postDamageTaken", [damage, type, source]);

        return damage;
    },

    //Champion attempts to act, prioritizing autoattacks before skills
    act: function() {
        //TODO: Implement Target skills
        /*for (var skill in this.skills) {
            if (this.skills.hasOwnProperty(skill)) {
                if (this.skills[skill].willCast() && this.skills[skill].casttime != 0) {
                    this.animation.timeleft = (this.skills[skill].casttime);
                    this.animation.action = skill;
                } else if (this.skills[skill].willCast()) {
                    this.skills[skill].cast();
                }
            }
        }*/
        if (Distance <= this.stats.attackrange.current && !this.crowdcontrol.cantAttack && Champion.targetable &&
            !this.isAnimating() && this.attacktimer <= 0 && (!Champion.stealthed || (Champion.stealthed && Champion.revealed))) {
            this.animation.timeleft = 0.1;
            this.animation.action = "autoattack";
            this.stealthed = false;
        }
    },

    isAnimating: function() {
        if (this.animation.timeleft != null) {
            return this.animation.timeleft > 0;
        } else {
            return false;
        }
    },

    autoAttack: function() {
        Log += "\tTarget attacks\n";

        var damage = this.stats.attackdamage.current * (1 + this.stats.critical.chance * (this.stats.critical.damage - 1));
        damage = this.dealDamage(damage, DAMAGE_TYPES.PHYSICAL, "autoattack");
        //Trigger all effects that occur on autoattacks
        this.processEvents("autoAttack", [damage]);

        //reset attack timer
        this.attacktimer = (1 / this.stats.attackspeed.current) - 0.1;
    },

    heal: function(amount) {
        amount *= this.healingeffect;

        this.stats.health.current = Math.min(this.stats.health.current + amount, this.stats.health.total);

        Log += "\tTarget heals for "+amount+ "\n";
        return amount;
    },

    calculateStats: function() {
        oldHealth = this.stats.health.total;
        this.stats.health.total = (this.stats.health.base+ this.stats.health.perlevel*this.stats.level + this.stats.health.flatbonus)*(1+this.stats.health.percentbonus);
        this.stats.health.bonus = this.stats.health.flatbonus*(1+this.stats.health.percentbonus) + (this.stats.health.base + this.stats.health.perlevel*this.stats.level + this.stats.health.flatbonus)*this.stats.health.percentbonus;
        this.stats.healthregen.current = (this.stats.healthregen.base + this.stats.healthregen.perlevel*this.stats.level + this.stats.healthregen.flatbonus)*(1+this.stats.healthregen.percentbonus);
        if (this.stats.health.current > this.stats.health.total) {
            this.stats.health.current = this.stats.health.total;
        }
        else if (this.stats.health.current < 0) {
            this.stats.health.current = 0;
        }
        //Handle max health changes
        this.stats.health.current += Math.max(this.stats.health.total - oldHealth, 0);

        oldMana = this.stats.mana.total;
        this.stats.mana.total = (this.stats.mana.base + this.stats.mana.perlevel*this.stats.level + this.stats.mana.flatbonus)*(1+this.stats.mana.percentbonus);
        this.stats.manaregen.current = (this.stats.manaregen.base + this.stats.manaregen.perlevel*this.stats.level + this.stats.manaregen.flatbonus)*(1+this.stats.manaregen.percentbonus);
        if (this.stats.mana.current > this.stats.mana.total) {
            this.stats.mana.current = this.stats.mana.total;
        }
        else if (this.stats.mana.current < 0) {
            this.stats.mana.current = 0;
        }
        //Handle max mana changes
        this.stats.mana.current += Math.max(this.stats.mana.total - oldMana, 0);

        this.stats.attackdamage.current = (this.stats.attackdamage.base + this.stats.attackdamage.perlevel*this.stats.level + this.stats.attackdamage.flatbonus)*(1+this.stats.attackdamage.percentbonus);
        this.stats.attackdamage.bonus = this.stats.attackdamage.flatbonus*(1+this.stats.attackdamage.percentbonus) + (this.stats.attackdamage.base + this.stats.attackdamage.perlevel*this.stats.level + this.stats.attackdamage.flatbonus)*this.stats.attackdamage.percentbonus;
        this.stats.attackspeed.current = this.stats.attackspeed.base*(1+this.stats.attackspeed.perlevel*this.stats.level+this.stats.attackspeed.percentbonus);
        //Apply attack speed cap
        if(this.stats.attackspeed.current > 2.5) {
            this.stats.attackspeed.current = 2.5;
        }
        this.stats.attackrange.current = this.stats.attackrange.base + this.stats.attackrange.flatbonus;

        this.stats.armor.current = (this.stats.armor.base + this.stats.armor.perlevel*this.stats.level + this.stats.armor.flatbonus)*(1+this.stats.armor.percentbonus);
        this.stats.armor.bonus = this.stats.armor.flatbonus*(1+this.stats.armor.percentbonus) + (this.stats.armor.base + this.stats.armor.perlevel*this.stats.level + this.stats.armor.flatbonus)*this.stats.armor.percentbonus;
        this.stats.magicresistance.current = (this.stats.magicresistance.base+ this.stats.magicresistance.perlevel*this.stats.level + this.stats.magicresistance.flatbonus)*(1+this.stats.magicresistance.percentbonus);
        this.stats.magicresistance.bonus = this.stats.magicresistance.flatbonus*(1+this.stats.magicresistance.percentbonus) + (this.stats.magicresistance.base + this.stats.magicresistance.perlevel*this.stats.level + this.stats.magicresistance.flatbonus)*this.stats.magicresistance.percentbonus;

        this.stats.movementspeed.beforeslows = (this.stats.movementspeed.base + this.stats.movementspeed.flatbonus)*(1+this.stats.movementspeed.percentbonus)*(1+this.stats.movementspeed.multpercentbonus);
        this.stats.movementspeed.current = this.stats.movementspeed.beforeslows;

        //Apply slows. Slow stacking is weird
        var maxslow = null;
        var maxvalue = 0;
        for (var slow in this.slows) {
            if (this.slows.hasOwnProperty(slow)) {
                if (this.slows[slow] > maxvalue) {
                    maxvalue = this.slows[slow];
                    maxslow = slow;
                }
            }
        }
        this.stats.movementspeed *= maxslow/100;
        for (var slow in this.slows) {
            if (this.slows.hasOwnProperty(slow)) {
                if (maxslow != slow) {
                    this.stats.movementspeed *= this.slows[slow]/100*0.35;
                }
            }
        }

        //Apply soft movespeed caps
        if (this.stats.movementspeed.current > 490) {
            this.stats.movementspeed.current = this.stats.movementspeed.current*0.5 + 230;
        }
        else if (this.stats.movementspeed.current > 415) {
            this.stats.movementspeed.current = this.stats.movementspeed.current*0.8 + 83;
        }
        else if (this.stats.movementspeed.current < 220) {
            this.stats.movementspeed.current = this.stats.movementspeed.current*0.5 + 110;
        }

        this.stats.abilitypower.current = (this.stats.abilitypower.base+ this.stats.abilitypower.perlevel*this.stats.level + this.stats.abilitypower.flatbonus)*(1+this.stats.abilitypower.percentbonus);
    },

    reset: function() {
        for(var effect in this.effects) {
            if (this.effects.hasOwnProperty(effect)) {
                this.effects[effect].remove();
            }
        }
        this.effects = {};
        this.events = {
            preDamageTaken: {},
            postDamageTaken: {},
            preDamageDealt: {},
            postDamageDealt: {},
            autoAttack: {},
            enemyAutoAttack: {},
            spellCast: {},
            enemySpellCast: {}
        };
        this.crowdcontrol.cantMove = 0;
        this.crowdcontrol.cantAttack = 0;
        this.crowdcontrol.cantCast = 0;
        this.slows = {};
        this.healingeffect = 1;
        this.targetable = true;
        this.attacktimer = 0;

        this.calculateStats();
        this.stats.health.current = this.stats.health.total;
        this.stats.mana.current = this.stats.mana.total;
    },

    tickDown: function() {
        // Apply regeneration every 0.5 seconds. Method of determining this is weird due to float rounding errors
        // Regen must be divided by 10, as it is stored as per 5s
        if(SimTime % 0.5 > (SimTime + TIME_STEP)% 0.5) {
            this.heal(this.stats.healthregen.current / 10);
            this.stats.mana.current += this.stats.manaregen.current / 10;
        }

        this.attacktimer -= TIME_STEP;

        //TODO: Implement Target Skills
        /*for (var skill in this.skills) {
            if (this.skills.hasOwnProperty(skill)) {
                this.skills[skill].cdtimer -= TIME_STEP;
            }
        }*/
        for (var effect in this.effects) {
            if (this.effects.hasOwnProperty(effect)) {
                this.effects[effect].duration -= TIME_STEP;
                if (this.effects[effect].duration <= 0) {
                    this.removeEffect(this.effects[effect]);
                } else {
                    this.effects[effect].tick();
                }
            }
        }

        //If animation has ended, use the skill or autoattack
        if (this.animation.timeleft != null) {
            this.animation.timeleft -= TIME_STEP;
            if (this.animation.timeleft <= 0) {
                if (this.animation.action == "autoattack") {
                    this.autoAttack();
                } else {
                    this.skills[this.animation.action].cast();
                }
                this.animation.timeleft = null;
                this.animation.action = null;
            }
        }

        //Attempt to use attacks or autoattacks
        this.act();

        this.calculateStats();
    },

    registerEvent: function(event, trigger) {
        this.events[trigger][event.name] = event;
    },

    removeEvent: function(event, trigger) {
        delete this.events[trigger][event.name];
    },

    removeEffect: function(effect) {
        this.effects[effect.name].remove();
        delete this.effects[effect.name];
    },

    //Adds an Effect and calls any functions required to initialize the effect
    addEffect: function(effect) {
        this.effects[effect.name] = effect;
        this.effects[effect.name].apply();
    },

    //Calls all events of a certain trigger, sending an array of arguments
    processEvents: function(trigger, arguments) {
        for (var event in this.events[trigger]) {
            if (this.events[trigger].hasOwnProperty(event)) {
                this.events[trigger][event].triggerEvent(arguments);
            }
        }
    }
};