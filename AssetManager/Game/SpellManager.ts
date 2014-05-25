﻿/*      Spell Manager to add and remove spells from characters. Example of use below:
*            SPELL = new SpellManager();
*            var spellkeys = Object.keys(JSON_CACHE['spell']['Spells']);
*            SPELL.AddSpell(battleList[0], spellkeys[3]);
*            SPELL.AddSpell(battleList[1], spellkeys[3]);
*/

var SPELL;
module Game {
    export class SpellManager{
        SpellKeys;
        constructor() {
            this.SpellKeys = Object.keys(JSON_CACHE['spell'].Spells);
        }
        AddSpell(character, SpellName) {
            for (var i = 0; i < this.SpellKeys.length; i++) {
                if (SpellName === this.SpellKeys[i]) {
                    character.Spells.push(SpellName);
                    break;
                }
            }
        }
        RemoveSpell(character, SpellName) {
            var keys = Object.keys(character.Spells);
            for (var i = 0; i < 5; i++) {
                if (SpellName === keys[i]) {
                    character.Spells[i] = null;
                    break;
                }
            }
        }
    }
}