/**
 * Created by kevinoverall on 8/1/14.
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
