/**
 * Created by kevinoverall on 4/24/14.
 */
app.controller("BuildCtrl", function($scope) {
    $scope.targetDummy = {
        level: 18,
        hp: 2000,
        mp: 1000,
        hpregen: 3.7,
        mpregen: 3.5,
        armor: 100,
        spellblock: 70,
        movespeed: 380,
        tenacity: 35,
        attackDamage: 150,
        attackSpeed: 1.5,
        physicalDps: 200,
        flatArmorPen: 8,
        percentArmorPen: 35,
        magicDps: 50,
        flatMagicPen: 0,
        percentMagicPen: 0,
        trueDps: 25,
        magicDamage: 0
    };
});