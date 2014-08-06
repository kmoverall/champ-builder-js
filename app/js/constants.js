/**
 * Created by kevinoverall on 8/1/14.
 */

//Champion related constants
//Links champion names to the Riot designated ID for that champion
var CHAMP_ID_MAP = {
    aatrox: 266
};

//Links riots keywords to specific stats to the variables needed internally in ChampBuilder
/*
Example usage:
Champion.stats[
    STAT_LINK_MAP[
        Champion.data.spells[0].vars[0]["link"]
    ]
    [0]
][
    STAT_LINK_MAP[
        Champion.data.spells[0].vars[0]["link"]
    ]
    [1]
]

Champion.data.spells[0].vars[n]["link"] points to the riot keyword for the stat
STAT_LINK_MAP[...][0] is the stat being used
STAT_LINK_MAP[...][1] is a modifier (total, bonus, etc.)
Champion.stats[STAT_LINK_MAP[...][0]][STAT_LINK_MAP[...][1]] will point to appropriate stat
 */
var STAT_LINK_MAP = {
    bonusattackdamage: ["attackdamage", "bonus"],
    spelldamage: ["abilitypower", "current"]
}

//Describes interactions between target and champion that occur, for reference by effects
var EVENTS = {
    ATTACKED: 0,
    WAS_ATTACKED: 1,
    USED_SKILL: 2,
    HIT_BY_SKILL: 3,
    DEALT_DAMAGE: 4,
    TOOK_DAMAGE: 5
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

//Graphing Constants
var MARGIN = 50;

//Simulation Constants
var MAX_TIME = 20;
var TIME_STEP = 0.1;
