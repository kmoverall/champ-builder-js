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

    $scope.$watch("targetDummy", function() {
        var targetForm = document.getElementsByClassName("targetInput");
        console.log($scope.targetDummy);
        for(i = 0; i < targetForm.length; i++) {
            targetForm.value = $scope.targetDummy[targetForm.name];
        }
    }, true);

    $scope.changePreset = function(preset) {
        console.log("Change Preset to "+preset);
        console.log($scope.targetDummy['hp']);
        switch(preset) {
            case "Marksman":
                $scope.targetDummy['hp'] = 1800;
                $scope.targetDummy['mp'] = 1200;
                $scope.targetDummy['hpregen'] = 2.5;
                $scope.targetDummy['mpregen'] = 3.1;
                $scope.targetDummy['armor'] = 100;
                $scope.targetDummy['spellblock'] = 60;
                $scope.targetDummy['movespeed'] = 410;
                $scope.targetDummy['tenacity'] = 0;
                $scope.targetDummy['attackDamage'] = 280;
                $scope.targetDummy['attackSpeed'] = 1.8;
                $scope.targetDummy['physicalDps'] = 210;
                $scope.targetDummy['flatArmorPen'] = 8;
                $scope.targetDummy['percentArmorPen'] = 40;
                $scope.targetDummy['magicDps'] = 30;
                $scope.targetDummy['flatMagicPen'] = 0;
                $scope.targetDummy['percentMagicPen'] = 5;
                $scope.targetDummy['trueDps'] = 25;
                $scope.targetDummy['magicDamage'] = 0;
                break;
            case "Assassin":
                $scope.targetDummy['hp'] = 2100;
                $scope.targetDummy['mp'] = 1200;
                $scope.targetDummy['hpregen'] = 2.5;
                $scope.targetDummy['mpregen'] = 3.1;
                $scope.targetDummy['armor'] = 100;
                $scope.targetDummy['spellblock'] = 90;
                $scope.targetDummy['movespeed'] = 380;
                $scope.targetDummy['tenacity'] = 35;
                $scope.targetDummy['attackDamage'] = 320;
                $scope.targetDummy['attackSpeed'] = 1;
                $scope.targetDummy['physicalDps'] = 400;
                $scope.targetDummy['flatArmorPen'] = 18;
                $scope.targetDummy['percentArmorPen'] = 55;
                $scope.targetDummy['magicDps'] = 0;
                $scope.targetDummy['flatMagicPen'] = 0;
                $scope.targetDummy['percentMagicPen'] = 5;
                $scope.targetDummy['trueDps'] = 25;
                $scope.targetDummy['magicDamage'] = 0;
                break;
            case "Mage":
                $scope.targetDummy['hp'] = 1800;
                $scope.targetDummy['mp'] = 1600;
                $scope.targetDummy['hpregen'] = 2.5;
                $scope.targetDummy['mpregen'] = 5.2;
                $scope.targetDummy['armor'] = 150;
                $scope.targetDummy['spellblock'] = 80;
                $scope.targetDummy['movespeed'] = 370;
                $scope.targetDummy['tenacity'] = 0;
                $scope.targetDummy['attackDamage'] = 100;
                $scope.targetDummy['attackSpeed'] = 0.9;
                $scope.targetDummy['physicalDps'] = 0;
                $scope.targetDummy['flatArmorPen'] = 0;
                $scope.targetDummy['percentArmorPen'] = 5;
                $scope.targetDummy['magicDps'] = 400;
                $scope.targetDummy['flatMagicPen'] = 23;
                $scope.targetDummy['percentMagicPen'] = 40;
                $scope.targetDummy['trueDps'] = 25;
                $scope.targetDummy['magicDamage'] = 650;
                break;
            case "Fighter":
                $scope.targetDummy['hp'] = 3100;
                $scope.targetDummy['mp'] = 1200;
                $scope.targetDummy['hpregen'] = 5.2;
                $scope.targetDummy['mpregen'] = 3.1;
                $scope.targetDummy['armor'] = 170;
                $scope.targetDummy['spellblock'] = 110;
                $scope.targetDummy['movespeed'] = 400;
                $scope.targetDummy['tenacity'] = 35;
                $scope.targetDummy['attackDamage'] = 150;
                $scope.targetDummy['attackSpeed'] = 1.3;
                $scope.targetDummy['physicalDps'] = 60;
                $scope.targetDummy['flatArmorPen'] = 0;
                $scope.targetDummy['percentArmorPen'] = 0;
                $scope.targetDummy['magicDps'] = 40;
                $scope.targetDummy['flatMagicPen'] = 0;
                $scope.targetDummy['percentMagicPen'] = 0;
                $scope.targetDummy['trueDps'] = 0;
                $scope.targetDummy['magicDamage'] = 0;
                break;
            case "Tank":
                $scope.targetDummy['hp'] = 3600;
                $scope.targetDummy['mp'] = 1200;
                $scope.targetDummy['hpregen'] = 5.5;
                $scope.targetDummy['mpregen'] = 4.0;
                $scope.targetDummy['armor'] = 200;
                $scope.targetDummy['spellblock'] = 150;
                $scope.targetDummy['movespeed'] = 390;
                $scope.targetDummy['tenacity'] = 35;
                $scope.targetDummy['attackDamage'] = 100;
                $scope.targetDummy['attackSpeed'] = 1;
                $scope.targetDummy['physicalDps'] = 0;
                $scope.targetDummy['flatArmorPen'] = 0;
                $scope.targetDummy['percentArmorPen'] = 0;
                $scope.targetDummy['magicDps'] = 100;
                $scope.targetDummy['flatMagicPen'] = 15;
                $scope.targetDummy['percentMagicPen'] = 0;
                $scope.targetDummy['trueDps'] = 0;
                $scope.targetDummy['magicDamage'] = 0;
                break;
            case "Support":
                $scope.targetDummy['hp'] = 2200;
                $scope.targetDummy['mp'] = 1500;
                $scope.targetDummy['hpregen'] = 3.0;
                $scope.targetDummy['mpregen'] = 4.5;
                $scope.targetDummy['armor'] = 140;
                $scope.targetDummy['spellblock'] = 120;
                $scope.targetDummy['movespeed'] = 370;
                $scope.targetDummy['tenacity'] = 0;
                $scope.targetDummy['attackDamage'] = 100;
                $scope.targetDummy['attackSpeed'] = 0.9;
                $scope.targetDummy['physicalDps'] = 0;
                $scope.targetDummy['flatArmorPen'] = 0;
                $scope.targetDummy['percentArmorPen'] = 0;
                $scope.targetDummy['magicDps'] = 80;
                $scope.targetDummy['flatMagicPen'] = 8;
                $scope.targetDummy['percentMagicPen'] = 0;
                $scope.targetDummy['trueDps'] = 0;
                $scope.targetDummy['magicDamage'] = 0;
                break;
        }
        console.log($scope.targetDummy['hp']);
    }
});