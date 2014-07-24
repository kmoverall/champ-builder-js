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
        cantCast: 0,
        slows: {}
    },
    takeDamage: function(damage, type, source) {
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

                //apply damage reduction
                if(source = DAMAGE_SOURCE.AUTOATTACK) {
                    damage = damage * (1 - this.damagereduction.auto.percent) * (1 - this.daamgereduction.physical.percent);
                    damage = damage - this.damagereduction.auto.flat - this.damagereduction.physical.flat;
                }
                else {
                    damage *= 1-this.damagereduction.physical.percent;
                    damage -= this.damagereduction.physical.flat;
                }
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

                //apply damage reduction
                damage *= 1-this.damagereduction.magic.percent;
                damage -= this.damagereduction.magic.flat;
                break;

            case DAMAGE_TYPES.TRUE:
                break;
        }

        //add categories to effects for non-time trigers

        this.stats.health.current -= damage;
    }
};

$(function() {
    setToPreset("marksman");

    $(".editPreset").click(function () {
        setToPreset(event.Target.id);
    });
});

function setToPreset(preset) {
    console.log("Setting Preset");
    var jqxhr = $.getJSON("js/Targetpresets.json", function(data){
        Target.stats = data[preset].stats;
        Target.skills = data[preset].skills;
        //Calculate stat panel info
        document.getElementById("physicalDPS").innerHTML = String(Math.floor(Target["stats"]["attackdamage"]["current"]*Target["stats"]["attackspeed"]["current"]*(1+Target["stats"]["critical"]["chance"]*Target["stats"]["critical"]["damage"])
                                                                    + Target["skills"]["0"]["damage"]/Target["skills"]["0"]["cooldown"]));
        document.getElementById("magicalDPS").innerHTML = String(Math.floor(Target["skills"]["1"]["damage"]/Target["skills"]["1"]["cooldown"]));
        document.getElementById("physicalHealth").innerHTML = String(Math.floor(Target["stats"]["health"]["total"]*((100+Target["stats"]["armor"]["current"])/100)));
        document.getElementById("magicalHealth").innerHTML = String(Math.floor(Target["stats"]["health"]["total"]*((100+Target["stats"]["magicresistance"]["current"])/100)));
    })
        .fail(function() {
            alert( "Error retrieving data from Champ Builder server. Please try again later" );
        });

    jqxhr.complete(function() {

    });
}