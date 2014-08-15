/**
 * Created by kevinoverall on 7/24/14.
 */



//Loading functions
$(function() {
    loadChampion("aatrox");
});

function loadChampion(champName) {
    champId = CHAMP_ID_MAP[champName];
    var jqxhr = $.getJSON("https://na.api.pvp.net/api/lol/static-data/na/v1.2/champion/"+champId+"?champData=all&api_key=d4e9f82e-4344-4719-a68f-1015c61a6bb4", function(data) {
        Champion.data = data;
        Champion.scriptlocation = "js/champion_scripts/"+champName+".js";
        Champion.initialize();
        console.log(Champion);
    })
        .fail(function() {
            alert( "Error connecting to Riot API. Please try again later" );
        });

}

var Champion = {
    data: {},
    scriptlocation: "",
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
    manaless: false,
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
    //Crowd control is listed by restricted actions
    //Slows are listed as an array of a strength and a duration
    crowdcontrol: {
        cantMove: false,
        cantAttack: false,
        cantCast: false,
        airborne: false
    },
    slows: [],
    shield: {
        standard: 0,
        physical: 0,
        magic: 0
    },
    healingreduced: false,
    targetable: true,
    attacktimer: 0,

    //Applies damage to this Champion of magnitude = damage, damage type = type (defined by DAMAGE_TYPES), and a damage source defined by DAMAGE_SOURCE
    takeDamage: function(damage, type, source) {
        this.processEvents("preDamageTaken", [damage, type, source]);

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

                Log += "\t" + this.data.name + " takes " + damage + " physical damage\n";
                break;

            case DAMAGE_TYPES.MAGIC:
                //apply magic resistance
                effective_mr = this.stats.magicresistance.current * (1 - Champion.stats.magicpenetration.percent) - Champion.stats.magicpenetration.flat;
                if (effective_mr >= 0) {
                    damage *= 100 / (100 + effective_mr);
                }
                else {
                    damage *= 2 - 100 / (100 - effective_mr)
                }

                //apply non-resistance damage reduction/amplification
                damage *= 1-this.stats.damagereduction.magic.percent;
                damage -= this.stats.damagereduction.magic.flat;

                Log += "\t" + this.data.name + " takes " + damage + " magic damage\n";
                break;

            case DAMAGE_TYPES.TRUE:
                Log += "\t" + this.data.name + " takes " + damage + " true damage\n";
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

        this.processEvents("postDamageTaken", [damage, type, source]);

        //Apply damage to current health
        this.stats.health.current -= remaining_damage;
        return damage;
    },

    //Champion autoattacks the target
    autoAttack: function() {
        if (Distance <= this.stats.attackrange.current && this.crowdcontrol.cantAttack <= 0 && Target.targetable) {
            Log += "\t" + this.data.name + " attacks\n";

            var damage = this.stats.attackdamage.current * (1 + this.stats.critical.chance * (this.stats.critical.damage - 1));
            this.processEvents("preDamageDealt", [damage, DAMAGE_TYPES.PHYSICAL, DAMAGE_SOURCE.AUTOATTACK]);
            damage = Target.takeDamage(damage, DAMAGE_TYPES.PHYSICAL, DAMAGE_SOURCE.AUTOATTACK);
            //Trigger all events that occur on autoattacks
            this.processEvents("autoAttack", [damage]);
            Target.processEvents("enemyAutoAttack", [damage]);
            this.processEvents("postDamageDealt", [damage, DAMAGE_TYPES.PHYSICAL, DAMAGE_SOURCE.AUTOATTACK]);
            this.heal(damage * this.stats.lifesteal);

            //reset attack timer
            this.attacktimer = 1 / this.stats.attackspeed.current;
        }
    },

    //Champion heals for an amount = amount
    heal: function(amount) {
        if (this.healingreduced) {
            amount = amount / 2;
        }

        this.stats.health.current = Math.min(this.stats.health.current + amount, this.stats.health.total);

        Log += "\t" + this.data.name + " heals for " + amount + "\n";
        return amount;
    },

    //Champion attempts to use a skill
    useSkill: function(skill) {
        if (this.skills[skill].willCast()) {
            this.skills[skill].cast();
        }
    },

    //Performs all functions that must occur every time the simulation advances by one step
    tickDown: function() {
        // Apply regeneration every 0.5 seconds. Method of determining this is weird due to float rounding errors
        // Regen must be divided by 10, as it is stored as per 5s
        if(SimTime % 0.5 > (SimTime + TIME_STEP)% 0.5) {
            this.heal(this.stats.healthregen.current / 10);
            this.stats.mana.current += this.stats.manaregen.current / 10;
        }

        this.attacktimer -= TIME_STEP;
        for (var skill in this.skills) {
            if (this.skills.hasOwnProperty(skill)) {
                this.skills[skill].cdtimer -= TIME_STEP;
            }
        }
        for (var effect in this.effects) {
            if (this.effects.hasOwnProperty(effect)) {
                this.effects[effect].duration -= TIME_STEP;
                this.effects[effect].tick();
                if (this.effects[effect].duration <= 0) {
                    this.removeEffect(effect);
                }
            }
        }

        this.calculateStats();
    },

    //TODO remove apply CC and shift over to effects system
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

    //Loads data from Riot API and sets data to the retrieved data
    initialize: function() {
        this.stats.health.base = this.data["stats"]["hp"];
        this.stats.health.perlevel = this.data["stats"]["hpperlevel"];

        this.stats.healthregen.base = this.data["stats"]["hpregen"];
        this.stats.healthregen.perlevel = this.data["stats"]["hpregenperlevel"];

        this.stats.mana.base = this.data["stats"]["mp"];
        this.stats.mana.perlevel = this.data["stats"]["mpperlevel"];

        this.stats.manaregen.base = this.data["stats"]["mpregen"];
        this.stats.manaregen.perlevel = this.data["stats"]["mpregenperlevel"];

        this.stats.attackdamage.base = this.data["stats"]["attackdamage"];
        this.stats.attackdamage.perlevel = this.data["stats"]["attackdamageperlevel"];

        this.stats.attackspeed.base = 0.625/(1+this.data["stats"]["attackspeedoffset"]);
        this.stats.attackspeed.perlevel = this.data["stats"]["attackspeedperlevel"]/100;

        this.stats.attackrange.base = this.data["stats"]["attackrange"];

        this.stats.armor.base = this.data["stats"]["armor"];
        this.stats.armor.perlevel = this.data["stats"]["armorperlevel"];

        this.stats.magicresistance.base = this.data["stats"]["spellblock"];
        this.stats.magicresistance.perlevel = this.data["stats"]["spellblockperlevel"];

        this.stats.movementspeed.base = this.data["stats"]["movespeed"];

        this.calculateStats();

        this.stats.health.current = this.stats.health.total;
        this.stats.mana.current = this.stats.mana.total;
    },

    //Calculates current stats based off of the base value, level, and any bonuses
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

    //Resets champion back to its initial state
    reset: function() {
        for(var effect in this.effects) {
            if (this.effects.hasOwnProperty(effect)) {
                this.effects[effect].remove();
            }
        }
        this.skills = [];
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
        Scripts.load;
        this.stats.health.current = this.stats.health.total;
        this.stats.mana.current = this.stats.mana.total;
    },

    //Adds an event to the appropriate array based on its trigger
    registerEvent: function(event, trigger) {
        this.events[trigger].push(event);
    },

    //Removes an event with a specified key from the appropriate trigger array
    removeEvent: function(key, trigger) {
        this.events[trigger].splice(key, 1);
    },

    //Removes an Effect and calls any functions required to end the effect
    removeEffect: function(key) {
        this.effects[key].remove();
        this.effects.splice(key, 1);
    },

    //Adds an Effect and calls any functions required to initialize the effect
    addEffect: function(effect) {
        this.effects.push(effect);
        effect.apply();
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

