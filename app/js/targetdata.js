/**
 * Created by kevinoverall on 5/15/14.
 */

$(function() {
    setToPreset("marksman");

    $(".editPreset").click(function () {
        setToPreset(event.target.id);
    });
});

function setToPreset(preset) {
    console.log("Setting Preset to "+preset);
    var jqxhr = $.getJSON("js/targetpresets.json", function(preset_data){
        Target.stats = preset_data[preset]["stats"];
        Target.skills = preset_data[preset]["skills"];

        //Calculate stat panel info
        document.getElementById("physicalDPS").innerHTML = String(Math.floor(Target.stats.attackdamage.current * Target.stats.attackspeed.current * (1+Target.stats.critical.chance * Target.stats.critical.damage)
            + Target.skills[0].damage / Target.skills[0].cooldown));
        document.getElementById("magicalDPS").innerHTML = String(Math.floor(Target.skills[1].damage / Target.skills[1].cooldown));
        document.getElementById("physicalHealth").innerHTML = String(Math.floor(Target.stats.health.total * ((100+Target.stats.armor.current)/100)));
        document.getElementById("magicalHealth").innerHTML = String(Math.floor(Target.stats.health.total * ((100+Target.stats.magicresistance.current)/100)));
    })
        .fail(function() {
            alert( "Error retrieving data from Champ Builder server. Please try again later" );
        });

    jqxhr.complete(function() {

    });
}

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
                percent: 0
            },
            physical: {
                flat: 0,
                percent: 0
            },
            magic: {
                flat: 0,
                percent: 0
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
    slows: [],
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
    healingreduced: false,
    targetable: true,
    attacktimer: 0,

    takeDamage: function(damage, type, source) {
        //Triggers effects based on current damage source
        switch(source) {
            case DAMAGE_SOURCE.AUTOATTACK:
                for(var event in this.events.enemyAutoAttack) {
                    if (this.events.enemyAutoAttack.hasOwnProperty(event)) {
                        this.events.enemyAutoAttack[event].triggerEvent(damage);
                    }
                }
                break;
            case DAMAGE_SOURCE.SKILL:
                for(var event in this.events.enemySpellCast) {
                    if (this.events.enemySpellCast.hasOwnProperty(event)) {
                        this.events.enemySpellCast[event].triggerEvent(damage);
                    }
                }
                break;
        }

        for(var event in this.events.preDamageTaken) {
            if (this.events.preDamageTaken.hasOwnProperty(event)) {
                this.events.preDamageTaken[event].triggerEvent(damage, type, source);
            }
        }

        //Reduces damage taken based on source and damage type
        switch(type) {
            case DAMAGE_TYPES.PHYSICAL:
                //apply armor
                effective_armor = this.stats.armor.current * (1 - Champion.stats.armorpenetration.percent) - Champion.stats.armorpenetration.flat;
                if (effective_armor >= 0) {
                    damage *= 100 / (100 + effective_armor);
                }
                else {
                    damage *= 2 - 100 / (100 - effective_armor)
                }

                //apply non-resistance damage reduction/amplification
                if(source = DAMAGE_SOURCE.AUTOATTACK) {
                    damage = damage * (1 - this.stats.damagereduction.auto.percent) * (1 - this.daamgereduction.physical.percent);
                    damage = damage - this.stats.damagereduction.auto.flat - this.stats.damagereduction.physical.flat;

                }
                else {
                    damage *= 1-this.stats.damagereduction.physical.percent;
                    damage -= this.stats.damagereduction.physical.flat;
                }

                Log += "\tTarget takes " + damage + " physical damage\n";
                break;

            case DAMAGE_TYPES.MAGIC:
                //apply magic resistance
                effective_mr = this.stats.magicresistance.current * (1 - Champion.stats.magicpenetration.percent) - Champion.stats.magicpenetration.flat;
                if (effective_armor >= 0) {
                    damage *= 100 / (100 + effective_armor);
                }
                else {
                    damage *= 2 - 100 / (100 - effective_armor)
                }

                //apply non-resistance damage reduction/amplification
                damage *= 1-this.stats.damagereduction.magic.percent;
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

        for(var event in this.events.postDamageTaken) {
            if (this.events.postDamageTaken.hasOwnProperty(event)) {
                this.events.postDamageTaken[event].triggerEvent(damage, type, source);
            }
        }

        //Apply damage to current health
        this.stats.health.current -= remaining_damage;
        return damage;
    },

    autoAttack: function() {
        if (Distance <= this.stats.attackrange.current && this.crowdcontrol.cantAttack <= 0 && Champion.targetable) {
            Log += "\tTarget attacks\n";

            var damage = this.stats.attackdamage.current * (1 + this.stats.critical.chance * (this.stats.critical.damage - 1));
            damage = Champion.takeDamage(damage, DAMAGE_TYPES.PHYSICAL, DAMAGE_SOURCE.AUTOATTACK);
            //Trigger all effects that occur on autoattacks
            for (var event in this.events.autoAttack) {
                if (this.events.autoAttack.hasOwnProperty(event)) {
                    this.events.autoAttack[event].triggerEvent(damage);
                }
            }
            for (var event in this.events.damageDealt) {
                if (this.events.damageDealt.hasOwnProperty(event)) {
                    this.events.damageDealt[event].triggerEvent(damage, DAMAGE_TYPES.PHYSICAL, DAMAGE_SOURCE.AUTOATTACK);
                }
            }

            this.heal(damage * this.stats.lifesteal);

            //reset attack timer
            this.attacktimer = 1 / this.stats.attackspeed.current;
        }
    },

    heal: function(amount) {
        if (this.healingreduced) {
            amount = amount / 2;
        }

        this.stats.health.current = Math.min(this.stats.health.current + amount, this.stats.health.total);

        Log += "\tTarget heals for "+amount+ "\n";
        return amount;
    },

    applyCC: function(move, attack, cast, slow, ignore_tenacity) {
        this.crowdcontrol.cantMove += ignore_tenacity ? move : move * (1 - this.stats.tenacity);
        this.crowdcontrol.cantAttack += ignore_tenacity ? attack : attack * (1 - this.stats.tenacity);
        this.crowdcontrol.cantCast += ignore_tenacity ? attack : attack * (1 - this.stats.tenacity);
        if(slow.length > 0) {
            slow["duration"] *= (1 - this.stats.tenacity);
            slow["strength"] *= (1 - this.stats.slowresist);
        }
        this.slows.push(slow);
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

        this.stats.movementspeed.current = (this.stats.movementspeed.base + this.stats.movementspeed.flatbonus)*(1+this.stats.movementspeed.percentbonus)*(1+this.stats.movementspeed.multpercentbonus);

        //Apply slows. Slow stacking is weird
        if (this.slows.length > 0) {
            var maxslow = 0;
            for (var i = 1; i < this.slows.length; i++) {
                if (this.slows[maxslow].current > this.slows[i].current) {
                    maxslow = i;
                }
            }
            this.stats.movementspeed.current *= this.slows[maxslow].current/100;
            for (var i = 0; i < this.slows.length; i++) {
                if (i != maxslow) {
                    this.stats.movementspeed.current *= this.slows[i].current/100*0.35;
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
        this.healingreduced = false;
        this.targetable = true;
        this.attacktimer = 0;

        this.calculateStats();
        this.stats.health.current = this.stats.health.total;
        this.stats.mana.current = this.stats.mana.total;
    },

    tickDown: function() {
        this.attacktimer -= TIME_STEP;
        for (var skill in this.skills) {
            if (this.skills.hasOwnProperty(skill)) {
                this.skills[skill].cdtimer -= TIME_STEP;
            }
        }
        this.crowdcontrol.cantMove -= TIME_STEP;
        this.crowdcontrol.cantAttack -= TIME_STEP;
        this.crowdcontrol.cantCast -= TIME_STEP;
        for (var slow in this.slows) {
            if (this.slows.hasOwnProperty(slow)) {
                this.slows[slow].slowtimer -= TIME_STEP;
                this.slows[slow].current -= (this.slows[slow].strength-this.slows[slow].decayTo)*(TIME_STEP/this.slows[slow].duration);
                if (this.slows[slow].slowtimer <= 0) {
                    this.slows.splice(slow, 1);
                }
            }
        }
        for (var effect in this.effects) {
            if (this.effects.hasOwnProperty(effect)) {
                this.effects[effect].duration -= TIME_STEP;
                this.effects[effect].tick();
                if (this.effects[effect].duration <= 0) {
                    this.removeEffect[effect];
                }
            }
        }

        this.calculateStats();
    },

    registerEvent: function(event, trigger) {
        this.events[trigger].push(event);
    },

    removeEvent: function(event, trigger) {
        this.events[trigger].splice(event, 1);
    },

    removeEffect: function(effectname) {
        this.effects[effectname].remove();
        this.effects.splice(effectname, 1);
    }

    
};



