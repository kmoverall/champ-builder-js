/**
 * Created by kevinoverall on 7/24/14.
 */

//Champion related constants
var CHAMP_ID_MAP = {
    aatrox: 266
};

var STAT_LINK_MAP = {
    bonusattackdamage: ["attackdamage", "bonus"]
}

//Describes interactions between target and champion that occur, for reference by effects
var EVENTS = {
    ATTACKED: 0,
    WAS_ATTACKED: 1,
    USED_SKILL: 2,
    HIT_BY_SKILL: 3,
    HIT_BY_PROJECTILE: 4
}

var DAMAGE_TYPES = {
    PHYSICAL: 0,
    MAGIC: 1,
    TRUE: 2
}

var DAMAGE_SOURCE = {
    AUTOATTACK: 0,
    SKILL: 1,
    OTHER: 2
}

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
    skills: [],
    effects: {},
    //Crowd control is listed by restricted actions as the key and duration as the value
    //Slows are listed as an effect and a duration
    crowdcontrol: {
        cantMove: 0,
        cantAttack: 0,
        cantCast: 0,
        slows: {}
    },

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
    }
}

