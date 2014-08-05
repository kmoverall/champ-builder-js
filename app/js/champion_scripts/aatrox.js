/**
 * Created by kevinoverall on 6/30/14.
 */
var Scripts = {
    load: function() {
        /*Champion.manaless = true;
        Champion.effects.BloodWellRevive = this.BloodWellRevive;
        Champion.effects.BloodWell = this.BloodWell;
        */
    },
    Q: {
        rank: 4,
        cooldown: Champion.data.spells[0].cooldown[this.rank]*(1-Champion.stats.cdr),
        range: Champion.data.spells[0].range[this.rank],
        cast: function() {

        }
    },
    W: {
        cast: function() {}
    },
    E: {
        cast: function() {}
    },
    R: {
        cast: function() {}
    },
    BloodWellRevive: {
        apply: function() {},
        tick: function() {},
        eventTriggered: function() {},
        remove: function() {}
    },
    BloodWell: {
        apply: function() {},
        tick: function() {},
        eventTriggered: function() {},
        remove: function() {}
    },
    BloodThirst: {
        apply: function() {},
        tick: function() {},
        eventTriggered: function() {},
        remove: function() {}
    },
    BloodPrice: {
        apply: function() {},
        tick: function() {},
        eventTriggered: function() {},
        remove: function() {}
    },
    Massacre: {
        apply: function() {},
        tick: function() {},
        eventTriggered: function() {},
        remove: function() {}
    }

}