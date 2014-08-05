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
    //Crowd control is listed by restricted actions as the key and duration as the value
    crowdcontrol: {
        cantMove: 0,
        cantAttack: 0,
        cantCast: 0

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

    takeDamage: function(damage, type, source) {
        //Triggers effects based on current damage source
        switch(source) {
            case DAMAGE_SOURCE.AUTOATTACK:
                for(var effect in this.effects) {
                    if (this.effects.hasOwnProperty(effect)) {
                        this.effects[effect].eventTriggered(EVENTS.WAS_ATTACKED);
                        this.effects[effect].eventTriggered(EVENTS.TOOK_DAMAGE);
                    }
                }
                break;
            case DAMAGE_SOURCE.SKILL:
                for(var effect in this.effects) {
                    if (this.effects.hasOwnProperty(effect)) {
                        this.effects[effect].eventTriggered(EVENTS.HIT_BY_SKILL);
                        this.effects[effect].eventTriggered(EVENTS.TOOK_DAMAGE);
                    }
                }
                break;
            case DAMAGE_SOURCE.OTHER:
                for(var effect in this.effects) {
                    if (this.effects.hasOwnProperty(effect)) {
                        this.effects[effect].eventTriggered(EVENTS.TOOK_DAMAGE);
                    }
                }
                break;
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
            for (var effect in this.effects) {
                if (this.effects.hasOwnProperty(effect)) {
                    this.effects[effect].eventTriggered(EVENTS.ATTACKED);
                    this.effects[effect].eventTriggered(EVENTS.DEALT_DAMAGE);
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

    calculateStats: function() {
        oldHealth = this.stats.health.total;
        this.stats.health.total = (this.stats.health.base+ this.stats.health.perlevel*this.stats.level + this.stats.health.flatbonus)*(1+this.stats.health.percentbonus);
        this.stats.health.bonus = this.stats.health.flatbonus*(1+this.stats.health.percentbonus) + (this.stats.health.base + this.stats.health.perlevel*this.stats.level + this.stats.health.flatbonus)*this.stats.health.percentbonus;
        this.stats.healthregen.current = (this.stats.healthregen.base + this.stats.healthregen.perlevel*this.stats.level + this.stats.healthregen.flatbonus)*(1+this.stats.healthregen.percentbonus);

        oldMana = this.stats.mana.total;
        this.stats.mana.total = (this.stats.mana.base + this.stats.mana.perlevel*this.stats.level + this.stats.mana.flatbonus)*(1+this.stats.mana.percentbonus);
        this.stats.manaregen.current = (this.stats.manaregen.base + this.stats.manaregen.perlevel*this.stats.level + this.stats.manaregen.flatbonus)*(1+this.stats.manaregen.percentbonus);

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

        this.stats.health.current += Math.max(this.stats.health.total - oldHealth, 0);
        this.stats.mana.current += Math.max(this.stats.mana.total - oldMana, 0);
    },

    reset: function() {
        for(var effect in this.effects) {
            if (this.effects.hasOwnProperty(effect)) {
                this.effects[effect].remove();
            }
        }
        this.effects = {};
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
    }

    
};



