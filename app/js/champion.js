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

//Loading functions
$(function() {
    loadChampion("aatrox");
});

function loadChampion(champName) {
    champId = CHAMP_ID_MAP[champName];
    var jqxhr = $.getJSON("https://na.api.pvp.net/api/lol/static-data/na/v1.2/champion/"+champId+"?champData=all&api_key=d4e9f82e-4344-4719-a68f-1015c61a6bb4", function(data) {
        Champion.data = data;
        //Champion.script = "js/champion_scripts/"+champName+".js";
        console.log(championData);
    })
        .fail(function() {
            alert( "Error connecting to Riot API. Please try again later" );
        });

}

var Champion = {
    data: championData,
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
        }
    },
    manaless: false,
    skills: [],
    effects: [],
    canCast: true,
    canAttack: true,
    canMove: true,

    initialize: function() {
        this.data = championData;

        this.health.base = this.data["stats"]["hp"];
        this.health.perlevel = this.data["stats"]["hpperlevel"];

        this.healthregen.base = this.data["stats"]["hpregen"];
        this.healthregen.perlevel = this.data["stats"]["hpregenperlevel"];

        this.mana.base = this.data["stats"]["mp"];
        this.mana.perlevel = this.data["stats"]["mpperlevel"];

        this.manaregen.base = this.data["stats"]["mpregen"];
        this.manaregen.perlevel = this.data["stats"]["mpregenperlevel"];

        this.attackdamage.base = this.data["stats"]["attackdamage"];
        this.attackdamage.perlevel = this.data["stats"]["attackdamageperlevel"];

        this.attackspeed.base = 1/(1.6*(1-this.data["stats"]["attackspeedoffset"]));
        this.attackspeed.perlevel = this.data["stats"]["attackspeedperlevel"]/100;

        this.attackrange.base = this.data["stats"]["attackrange"];

        this.armor.base = this.data["stats"]["armor"];
        this.armor.perlevel = this.data["stats"]["armorperlevel"];

        this.magicresistance.base = this.data["stats"]["spellblock"];
        this.magicresistance.perlevel = this.data["stats"]["spellblockperlevel"];

        this.movementspeed.base = this.data["stats"]["movespeed"];

        this.calculateStats();

        this.health.current = this.health.total;
        this.mana.current = this.mana.total;
    },

    calculateStats: function() {
        oldHealth = this.health.total;
        this.health.total = (this.health.base+ this.health.perlevel*this.level + this.health.flatbonus)*(1+this.health.percentbonus);
        this.health.bonus = this.health.flatbonus*(1+this.health.percentbonus) + (this.health.base + this.health.perlevel*this.level + this.health.flatbonus)*this.health.percentbonus;
        this.healthregen.current = (this.healthregen.base + this.healthregen.perlevel*this.level + this.healthregen.flatbonus)*(1+this.healthregen.percentbonus);

        oldMana = this.mana.total;
        this.mana.total = (this.mana.base + this.mana.perlevel*this.level + this.mana.flatbonus)*(1+this.mana.percentbonus);
        this.manaregen.current = (this.manaregen.base + this.manaregen.perlevel*this.level + this.manaregen.flatbonus)*(1+this.manaregen.percentbonus);

        this.attackdamage.current = (this.attackdamage.base + this.attackdamage.perlevel*this.level + this.attackdamage.flatbonus)*(1+this.attackdamage.percentbonus);
        this.attackdamage.bonus = this.attackdamage.flatbonus*(1+this.attackdamage.percentbonus) + (this.attackdamage.base + this.attackdamage.perlevel*this.level + this.attackdamage.flatbonus)*this.attackdamage.percentbonus;
        this.attackspeed.current = this.attackspeed.base*(1+this.attackspeed.perlevel*this.level+this.attackspeed.percentbonus);
        //Apply attack speed cap
        if(this.attackspeed.current > 2.5) {
            this.attackspeed.current = 2.5;
        }
        this.attackrange.current = this.attackrange.base + this.attackrange.flatbonus;

        this.armor.current = (this.data.armor.base+ this.armor.perlevel*this.level + this.armor.flatbonus)*(1+this.armor.percentbonus);
        this.armor.bonus = this.armor.flatbonus*(1+this.armor.percentbonus) + (this.armor.base + this.armor.perlevel*this.level + this.armor.flatbonus)*this.armor.percentbonus;
        this.magicresistance.current = (this.data.magicresistance.base+ this.magicresistance.perlevel*this.level + this.magicresistance.flatbonus)*(1+this.magicresistance.percentbonus);
        this.magicresistance.bonus = this.magicresistance.flatbonus*(1+this.magicresistance.percentbonus) + (this.magicresistance.base + this.magicresistance.perlevel*this.level + this.magicresistance.flatbonus)*this.magicresistance.percentbonus;

        this.movementspeed.current = (this.movementspeed.base + this.movementspeed.flatbonus)*(1+this.movementspeed.percentbonus)*(1+this.movementspeed.multpercentbonus);
        //Apply soft movespeed caps
        if (this.movementspeed.current > 490) {
            this.movementspeed.current = this.movementspeed.current*0.5 + 230;
        }
        else if (this.movementspeed.current > 415) {
            this.movementspeed.current = this.movementspeed.current*0.8 + 83;
        }
        else if (this.movementspeed.current < 220) {
            this.movementspeed.current = this.movementspeed.current*0.5 + 110;
        }

        this.abilitypower.current = (this.abilitypower.base+ this.abilitypower.perlevel*this.level + this.abilitypower.flatbonus)*(1+this.abilitypower.percentbonus);

        this.health.current += Math.max(this.health.total - oldHealth, 0);
        this.mana.current += Math.max(this.mana.total - oldMana, 0);
    }
}

