﻿function getBattleStates() {
    return {
        "PrePlayerTurn": 0,
        "PSelectCommand": 1,
        "PAtkSelectTarget": 2, //last for attack to back
        "PAtkAnim": 3,
        "PAttack": 4,
        "SpellDraw": 5,
        "SpellSelect": 6,
        "SpellTarget": 7, //last point
        "SpellAnim": 8,
        "SpellCast": 9,
        "PDefend": 10,
        "ItemDraw": 11,
        "ItemSelect": 12,
        "ItemSelectTarget": 13,  //last point
        "ItemAnim": 14,
        "ItemUse": 15,
        "PreEnemyTurn": 16,
        "EAttack": 17,
        "EAttackAnim": 18,
        "ESpellAnim": 19,
        "ESpellCast": 20,
        "EDefend": 21,
        "EndTurn": 22,
        "PreLevelUp": 23,
        "LevelUp": 24,
        "BattleEnd": 25
    };
}