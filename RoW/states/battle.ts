﻿///<reference path='State.ts' />
module Game {
    export class Battle extends State {
        nextState;
        nextID;
        queue: Sprite[];
        menu;
        context: CanvasRenderingContext2D;
        context2: CanvasRenderingContext2D;
        states;
        cTurn;
        cState;
        mx;
        my;
        newTime = 0;
        cTarget;
        cSpell;
        cSpellData;
        turnDelay;
        Anim: Animation;
        playerCount = 0;
        mapID;
        endCondition;
        back;
        items;
        cItem;
        constructor(EnemyID, mapID) {
            super();
            //time to wait between actions
            this.turnDelay = 500;
            //get canvases from html
            var canvas = <HTMLCanvasElement> document.getElementById('layer1');
            this.context = canvas.getContext('2d');
            var canvas2 = <HTMLCanvasElement> document.getElementById('layer2');
            this.context2 = canvas2.getContext('2d');
            //initalize animation class 
            this.Anim = new Animation(this.context2);
            //saves the next state and ID the player will go if victory is achieved
            this.nextState = JSON_CACHE['Enemies']['EnemyGroups'][EnemyID].next;
            this.nextID = JSON_CACHE['Enemies']['EnemyGroups'][EnemyID].ID;
            this.mapID = mapID;
            //Battle queue is now in the queue variable
            this.queue = [];
            this.queue = battleList;
            //initialize party members stats for current for the battle
            for (var y = 0; y < this.queue.length; y++) {
                this.queue[y].Current = this.queue[y].getTotalStats();
            }
            //initializes battle positions for all characters in the battle list
            var enemies = initializeBattlePositions(EnemyID);
            for (var x = 0; x < enemies.length; x++) {
                this.queue.push(enemies[x]);
            }
            //use function to add all the menu items to the menu array
            this.menu = [];
            this.menu = initializeMenuBounds();
            //Use function to add all the item bounds for all the current items the player has
            this.items = [];
            this.items = initializeItemBounds();
            //current spell and data
            this.cSpell = [];
            this.cSpellData = [];
            //the states that the battle can be in which would alter what is drawn and listened from input
            this.states = getBattleStates();
            this.back = {
                "Name": "back",
                "x": 700,
                "y": 25,
                "w": 40,
                "h": 40
            }
        }
        drawLayer1() {
            //clears screen
            this.context.clearRect(0, 0, 800, 600);
            //draws static background
            this.context.drawImage(IMAGE_CACHE['bg'], 0, 0);
            //can add additional background details in this layer
            //draws HUD window and labels above the data
            quickWindow(this.context, 100, 375, 600, 220, "blue", "red");
            //set text properties
            setStyle(this.context, 'Calibri', '12 pt', 'white', 'bold');
            this.context.fillText("Party", 550, 385);
            this.context.fillText("Enemies", 200, 385);
            //draws all the sprites from the queue and the HUD text as well
            for (var s = 0; s < this.queue.length; s++) {
                if (this.queue[s].currentState !== 1) {
                    //this.context2.fillText(this.queue[s].Base.ID, this.queue[s].dx, this.queue[s].dy - 15)
                    this.queue[s].render(this.context);
                }
                //sprite is ally then print name and HP
                if (this.queue[s].Base.Type === 0 && this.queue[s].currentState !== 1) {
                    this.context.fillText(this.queue[s].Base.ID, 500, 400 + (s * 20));
                    this.context.fillText(this.queue[s].Current.HP + " / " + this.queue[s].getTotalStats().HP, 600, 400 + (s * 20));
                }
                //else prints enemy name in different column
                else if (this.queue[s].Base.Type === 1 && this.queue[s].currentState !== 1) {
                    this.context.fillText(this.queue[s].Base.ID, 200, 400 + (s * 20));
                    this.context.fillText(this.queue[s].Current.HP + " / " + this.queue[s].getTotalStats().HP, 250, 400 + (s * 20));
                }
            }
        }
        drawLayer2() {
            //clears layer
            this.context2.clearRect(0, 0, 800, 600);
            //draws menu or graphics based on state of battle
            StateDialogs(this.context2, this.cState);
        }
        init() {
            //sets state to player turn
            this.cState = this.states["PrePlayerTurn"];
            this.drawLayers();
            //sets current turn to 0 
            this.cTurn = 0;
        }
        update() {
            //stores the current time
            var time = Date.now();
            //actions that are done before the player selects something in their turn
            if (this.cState === this.states["PrePlayerTurn"]) {
                this.PlayerTurnInit();
            }
            //actions that are done if player is to select a command
            if (this.cState === this.states["PSelectCommand"] && mouseClicked() && time > this.newTime) {
                this.playerSelectCommand();
            }
            /* 
                Player Attack Events start here 
            */
            else if (this.cState === this.states["PAtkSelectTarget"] && mouseClicked()) {
                this.playerSelectAttackTarget();
            }
            else if (this.cState === this.states["PAtkAnim"]) {
                if (this.Anim.finishPlaying) {
                    this.cState = this.states['PAttack'];
                    this.drawLayers();
                    this.newTime = Date.now() + this.turnDelay;
                }
            }
            else if (this.cState === this.states["PAttack"] && time > this.newTime) {
                this.playerAttack();
            }
            /* 
                Player Spell Events start here 
            */
            else if (this.cState === this.states["SpellDraw"]) {
                this.spellCommandInit();
            }
            else if (this.cState === this.states["SpellSelect"] && mouseClicked()) {
                this.selectSpell();
            }
            else if (this.cState === this.states["SpellTarget"] && mouseClicked()) {
                this.spellTarget();
            }
            else if (this.cState === this.states["SpellAnim"]) {
                if (this.Anim.finishPlaying) {
                    this.cState = this.states['SpellCast'];
                    this.drawLayers();
                }
            }
            else if (this.cState === this.states["SpellCast"]) {
                this.spellCast();
            }
            /* 
                Player Defend Events start here 
            */
            else if (this.cState === this.states["PDefend"]) {
                this.playerDefend();
            }
            /* 
               PLayer Item events start here 
           */
            else if (this.cState === this.states["ItemDraw"]) {
                this.itemCommandInit();
            }
            else if (this.cState === this.states["ItemSelect"] && mouseClicked()) {
                this.itemSelect();
            }
            else if (this.cState === this.states["ItemSelectTarget"] && mouseClicked()) {
                this.itemSelectTarget();
            }
            /* 
                Enemy Events start here 
            */
            else if (this.cState === this.states["PreEnemyTurn"]) {
                this.enemyTurnInit();
            }
            else if (this.cState === this.states["EAttackAnim"] && time > this.newTime) {
                if (this.Anim.finishPlaying) {
                    this.drawLayers();
                    this.cState = this.states['EAttack'];

                    this.newTime = time + this.turnDelay;
                }
            }
            else if (this.cState === this.states["EAttack"] && time > this.newTime) {
                this.enemyAttack();
                this.newTime = time + this.turnDelay;
            }
            else if (this.cState === this.states["ESpellAnim"] && time > this.newTime) {
                if (this.Anim.finishPlaying) {
                    this.drawLayers();
                    this.newTime = time + this.turnDelay;
                    this.cState = this.states['ESpellCast'];

                }
            }
            else if (this.cState === this.states["ESpellCast"] && time > this.newTime) {
                this.CheckIfDead();
                this.drawLayers();
                this.newTime = time + this.turnDelay;
                this.queue = EnemySpellCast(this.context2, this.cSpell, this.queue, this.cTarget, this.queue[this.cTurn]);
                this.cState = this.states["EndTurn"];

            }
            else if (this.cState === this.states["EDefend"] && time > this.newTime) {
                this.queue[this.cTurn].defend = true;
                this.cState = this.states["EndTurn"];
                this.drawLayers();
                this.newTime = time + this.turnDelay;
            }
            else if (this.cState === this.states["EndTurn"] && time > this.newTime) {
                this.endTurn();
            }
            /* 
                End of Battle Events start here 
            */
            else if (this.cState === this.states["PreLevelUp"] && time > this.newTime) {
                this.levelUpInit();
            }
            else if (this.cState === this.states["LevelUp"] && mouseClicked()) {
                this.levelUp();
            }
            else if (this.cState === this.states["EndBattle"] && time > this.newTime) {
                this.endBattle();
            }
        }
        drawLayers() {
            //draw objects on layer 1 of the canvas
            this.drawLayer1();
            //draw objects on layer 2 of the canvas
            this.drawLayer2();
        }
        CheckIfDead() {
            for (var x = 0; x < this.queue.length; x++) {
                //check if any units have died and removes them appropriately
                if (this.queue[x].Current.HP <= 0) {
                    this.queue[x].currentState = 1;
                    //check if all units on either side have been wiped out to detect if battle ended
                    this.isBattleOver();
                }
            }
        }
        isBattleOver() {
            var aHP = 0;
            var eHP = 0;
            //loop to get the total health of all the sprites on screen
            for (var y = 0; y < this.queue.length; y++) {
                if (this.queue[y].Base.Type === 0 && this.queue[y].currentState !== 1) {
                    aHP += this.queue[y].Current.HP;
                }
                if (this.queue[y].Base.Type === 1 && this.queue[y].currentState !== 1) {
                    eHP += this.queue[y].Current.HP;
                }
            }
            //all allies are dead then game over
            if (aHP <= 0) {
                this.context2.fillText("Defeat", 400, 300);
                this.cState = this.states['EndBattle'];
                this.newTime = Date.now() + this.turnDelay;
                this.endCondition = "Defeat";
            }
            //all enemies defeated then levelup characters then end battle
            if (eHP <= 0) {
                this.context2.fillText("Victory", 400, 300);
                this.cState = this.states['PreLevelUp'];
                this.newTime = Date.now() + this.turnDelay;
                this.endCondition = "Victory";
            }
        }
        /*
            initial events to prepare before player's turn
        */
        PlayerTurnInit() {
            //sets font type and style
            setStyle(this.context2, 'calibre', 12, "white");
            //sets the next state to go to
            this.cState = this.states["PSelectCommand"];
            //redraw layers to match new state
            this.drawLayers();
            //time to wait before executing new state
            this.newTime = Date.now() + this.turnDelay;
            //status text to let the player know its there turn and the status effects on them
            this.context2.fillText(this.queue[this.cTurn].Base.ID, 350, 25);
            this.queue[this.cTurn] = applyStatusEffect(this.context2, this.queue[this.cTurn]);
        }
        /*
            takes players input to determine which command was chosen and changes the state appropriately
        */
        playerSelectCommand() {
            //gets mouse coordinates
            this.mx = mEvent.pageX;
            this.my = mEvent.pageY;
            for (var i = 0; i < this.menu.length; i++) {
                var a1 = this.menu[i].x;
                var a2 = this.menu[i].x + this.menu[i].w;
                var b1 = this.menu[i].y;
                var b2 = this.menu[i].y + this.menu[i].h;
                if ((a1 <= this.mx && this.mx <= a2) && (b1 <= this.my && this.my <= b2)) {
                    switch (this.menu[i].Name) {
                        case "Attack":
                            this.cState = this.states["PAtkSelectTarget"];
                            break;
                        case "Spell":
                            this.cState = this.states["SpellDraw"];
                            break;
                        case "Defend":
                            this.cState = this.states["PDefend"];
                            break;
                        case "Item":
                            this.cState = this.states["ItemDraw"];
                            break;
                        default:
                            break;
                    }
                    this.drawLayers();
                }
            }
        }
        /*
            Selects target to attack and saves target then playing animation then changing to the next state
        */
        playerSelectAttackTarget() {
            //get couse coordinates
            this.mx = mEvent.pageX;
            this.my = mEvent.pageY;
            //get upper bounds of x and y for the back button
            var upperx = this.back.x + this.back.w;
            var uppery = this.back.y + this.back.h;
            //detects if the back button has been touched
            if ((this.back.x <= this.mx && this.mx <= upperx) && (this.back.y <= this.my && this.my <= uppery)) {
                this.cState = this.states["PSelectCommand"];
                this.drawLayers();
            }
            else {
                for (var i = 0; i < this.queue.length; i++) {
                    var s1 = this.queue[i].dx;
                    var s2 = this.queue[i].dx + this.queue[i].W;
                    var d1 = this.queue[i].dy;
                    var d2 = this.queue[i].dy + this.queue[i].H;
                    if ((s1 <= this.mx && this.mx <= s2) && (d1 <= this.my && this.my <= d2)) {
                        //if sprite is an enemy and is not dead
                        if (this.queue[i].Base.Type === 1 && this.queue[i].currentState !== 1) {
                            this.cTarget = i; //sets current target
                            this.cState = this.states["PAtkAnim"];//sets current state
                            this.drawLayers();
                            this.Anim.queueAnimation(ANIM_CACHE['slash'], this.queue[this.cTarget].dx, this.queue[this.cTarget].dy); //queues animation to be played
                            this.Anim.play(); //start the animation
                            break;
                        }
                    }
                }
            }
        }
        /*
            Attacks target and moves on to next state
        */
        playerAttack() {
            this.newTime = Date.now() + this.turnDelay;
            this.cState = this.states['EndTurn']; //end of turn for character
            this.drawLayers();
            //takes context, the attacker and target to calculate the effects of attacking the target and returns the results
            var sprites = Attack(this.context2, this.queue[this.cTurn], this.queue[this.cTarget]);
            this.queue[this.cTurn] = sprites.Atk; //the attacker
            this.queue[this.cTarget] = sprites.Tar; //the target
            this.CheckIfDead(); //checks if any sprite has died and makes the necessary changes
        }
        /*
            Player defends, taking reduced damage and moves on to next state
        */
        playerDefend() {
            this.queue[this.cTurn].defend = true;
            this.cState = this.states["EndTurn"];
            this.drawLayers();
            this.newTime = Date.now() + this.turnDelay;
        }
        /*
            Draws spell dialogs and stuff for preparation of SelectSpell state
        */      
        spellCommandInit() {
            //current spell
            this.cState = this.states["SpellSelect"];
            this.drawLayers();
            //data for spell to be used later
            this.cSpellData = SpellSelectDialog(this.queue[this.cTurn], this.context2);
        }
        /*
            Takes player input to determine spell to cast
        */
        selectSpell() {
            var spells = Object.keys(JSON_CACHE['spell']['Spells']);
            this.mx = mEvent.pageX;
            this.my = mEvent.pageY;
            var upperx = this.back.x + this.back.w;
            var uppery = this.back.y + this.back.h;
            if ((this.back.x <= this.mx && this.mx <= upperx) && (this.back.y <= this.my && this.my <= uppery)) {
                this.cState = this.states["PSelectCommand"];
                this.drawLayers();
            }
            else {
                for (var i = 0; i < this.cSpellData.length; i++) {
                    var a1 = this.cSpellData[i].x;
                    var a2 = this.cSpellData[i].x + this.cSpellData[i].w;
                    var b1 = this.cSpellData[i].y;
                    var b2 = this.cSpellData[i].y + this.cSpellData[i].h;
                    if ((a1 <= this.mx && this.mx <= a2) && (b1 <= this.my && this.my <= b2)) {
                        for (var x = 0; x < spells.length; x++) {
                            if (this.cSpellData[i].name === spells[x]) {
                                this.cSpell = JSON_CACHE['spell']['Spells'][spells[x]];
                                this.cState = this.states["SpellTarget"];
                                this.drawLayers();
                                break;
                            }
                        }
                    }
                }
            }
        }
        /*
            takes player input to determine target to cast spell on
        */
        spellTarget() {
            var bounds = [];
            if (this.cSpell.All === 0) {
                //select target
                this.mx = mEvent.pageX;
                this.my = mEvent.pageY;
                var upperx = this.back.x + this.back.w;
                var uppery = this.back.y + this.back.h;
                if ((this.back.x <= this.mx && this.mx <= upperx) && (this.back.y <= this.my && this.my <= uppery)) {
                    this.cState = this.states["SpellDraw"];
                    this.drawLayers();
                }
                else {
                    for (var i = 0; i < this.queue.length; i++) {
                        var x1 = this.queue[i].dx;
                        var x2 = this.queue[i].dx + this.queue[i].W;
                        var y1 = this.queue[i].dy;
                        var y2 = this.queue[i].dy + this.queue[i].H;
                        if ((x1 <= this.mx && this.mx <= x2) && (y1 <= this.my && this.my <= y2)) {
                            this.cTarget = i;
                            this.cState = this.states["SpellAnim"];
                            this.drawLayers();
                            this.Anim.queueAnimation(ANIM_CACHE['slash'], this.queue[this.cTarget].dx, this.queue[this.cTarget].dy);
                            this.Anim.play();
                        }
                    }
                }
            }
            else if (this.cSpell.All === 1) {
                this.cState = this.states["SpellAnim"];
                this.drawLayers();
            }
        }
        /*
            cast spell on target
        */  
        spellCast() {
            if (this.cSpell.All === 0) {
                var sprite = castSpellSingle(this.context2, this.cSpell, this.queue[this.cTarget], this.queue[this.cTurn]);
                this.queue[this.cTarget] = sprite;
            }
            else if (this.cSpell.All === 1) {
                //go ahead and cast
                this.queue = castSpellAll(this.context2, this.cSpell, this.queue, this.queue[this.cTurn]);
            }
            this.cState = this.states["EndTurn"];
            this.CheckIfDead();
            this.drawLayers();
            this.newTime = Date.now() + this.turnDelay;
        }
        /*
            initailizes item command dialogs
        */
        itemCommandInit() {
            this.cState = this.states["ItemSelect"];
            this.drawLayers();
            quickWindow(this.context2, 10, 300, 500, 500, "blue", "red");
            var ikeys = Object.keys(ITEM.consumable);
            var items = ITEM.consumable;
            setStyle(this.context2, 'calibre', 12, "white");
            for (var x = 0; x < ikeys.length; x++) {
                this.context2.fillText(items[ikeys[x]].name, 25, 320 + (x * 30));
                this.context2.fillText(items[ikeys[x]].quantity, 100, 320 + (x * 30));
            }
        }
        /*
            takes palyer input to select item to use
        */
        itemSelect() {
            this.mx = mEvent.pageX;
            this.my = mEvent.pageY;
            var upperx = this.back.x + this.back.w;
            var uppery = this.back.y + this.back.h;
            if ((this.back.x <= this.mx && this.mx <= upperx) && (this.back.y <= this.my && this.my <= uppery)) {
                this.cState = this.states["PSelectCommand"];
                this.drawLayers();
            }
            else {
                for (var i = 0; i < this.items.length; i++) {
                    var a1 = this.items[i].x;
                    var a2 = this.items[i].x + this.items[i].w;
                    var b1 = this.items[i].y;
                    var b2 = this.items[i].y + this.items[i].h;
                    if ((a1 <= this.mx && this.mx <= a2) && (b1 <= this.my && this.my <= b2)) {
                        this.cItem = this.items[i].name;
                        this.cState = this.states["ItemSelectTarget"];
                        this.drawLayers();
                    }
                }
            }
        }
        /*
            takes player input to select target to use item on
        */
        itemSelectTarget() {
            var mx = mEvent.pageX;
            var my = mEvent.pageY;
            var upperx = this.back.x + this.back.w;
            var uppery = this.back.y + this.back.h;
            if ((this.back.x <= this.mx && this.mx <= upperx) && (this.back.y <= this.my && this.my <= uppery)) {
                this.cState = this.states["ItemSelect"];
                this.drawLayers();
            }
            else {
                for (var i = 0; i < this.queue.length; i++) {
                    var x1 = this.queue[i].dx;
                    var x2 = this.queue[i].dx + this.queue[i].W;
                    var y1 = this.queue[i].dy;
                    var y2 = this.queue[i].dy + this.queue[i].H;
                    if ((x1 <= mx && mx <= x2) && (y1 <= my && my <= y2)) {
                        this.queue[i] = UseItem(this.context2, this.cItem, this.queue[i]);
                        this.cState = this.states["EndTurn"];
                        this.drawLayers();
                    }
                }
            }
        }
        /*
            initalizes enemy trn dialogs
        */
        enemyTurnInit() {
            this.drawLayers();
            this.newTime = Date.now() + this.turnDelay;
            this.queue[this.cTurn] = applyStatusEffect(this.context2, this.queue[this.cTurn]);
            var cAbility = EnemyActionChooser(this.queue[this.cTurn], this.queue);

            var allyCount = [];
            for (var x = 0; x < this.queue.length; x++) {
                if (this.queue[x].Base.Type === 0 && this.queue[x].currentState !== 1) {
                    allyCount.push(x);
                }
            }
            var rand = getRandomInt(0, allyCount.length - 1);
            //get random int to determine which ally to target
            this.cTarget = allyCount[rand];

            switch (cAbility) {
                case "Attack":
                    this.cState = this.states["EAttackAnim"];
                    this.Anim.queueAnimation(ANIM_CACHE['slash'], this.queue[this.cTarget].dx, this.queue[this.cTarget].dy);
                    this.Anim.play();
                    this.newTime = Date.now() + this.turnDelay;
                    break;
                case "Defend":
                    this.cState = this.states["EDefend"];
                    break;
                default:
                    var spellkey = Object.keys(JSON_CACHE['spell']['Spells']);
                    for (var x = 0; x < spellkey.length; x++) {
                        if (cAbility === spellkey[x]) {
                            this.cSpell = JSON_CACHE['spell']['Spells'][spellkey[x]];
                            break;
                        }
                    }
                    this.cState = this.states["ESpellAnim"];
                    this.Anim.queueAnimation(ANIM_CACHE['slash'], this.queue[this.cTarget].dx, this.queue[this.cTarget].dy);
                    this.Anim.play();
                    this.newTime = Date.now() + this.turnDelay;
                    break;
            }
            this.drawLayers();
        }
        /*
            Enemy attack target
        */
        enemyAttack() {

            this.cState = this.states["EndTurn"];
            this.drawLayers();

            var attack = Attack(this.context2, this.queue[this.cTurn], this.queue[this.cTarget]);
            this.queue[this.cTarget] = attack.Tar;
            this.CheckIfDead();
        }
        /*
            end turn but moving on to the next sprite in queue and resetting the current turn number if all sprites 
            have taken action
        */
        endTurn() {
            this.cTurn = (this.cTurn + 1) % this.queue.length;
            if (this.queue[this.cTurn].Base.Type === 0 && this.queue[this.cTurn].currentState !== 1) {
                this.cState = this.states["PrePlayerTurn"];
                this.drawLayers();
            }
            else if (this.queue[this.cTurn].Base.Type === 1 && this.queue[this.cTurn].currentState !== 1) {
                this.cState = this.states["PreEnemyTurn"];
                this.drawLayers();
            }
        }
        /*
            initialize leveup dialogs
        */
        levelUpInit() {
            for (var q = 0; q < this.queue.length; q++) {
                if (this.queue[q].Base.Type === 1) {
                    battleList.splice(q, this.queue.length - q);
                }
            }
            if (this.queue[this.playerCount].Base.Type === 0) {
                LevelUp(this.queue[this.playerCount], this.context2);
                this.playerCount++;
            }
            this.cState = this.states["LevelUp"];
        }
        /*
            levelup characters in your party
        */
        levelUp() {
            if (this.playerCount >= this.queue.length) {
                this.cState = this.states["EndBattle"];
                this.drawLayers();
            }
            else {
                if (this.queue[this.playerCount].Base.Type === 0) {
                    LevelUp(this.queue[this.playerCount], this.context2);
                    this.playerCount++;
                }
            }
        }
        /*
            Clears screen and pops state to end battle
        */
        endBattle() {
            this.context.clearRect(0, 0, GAME_WIDTH, GAME_HEIGHT);
            this.context2.clearRect(0, 0, GAME_WIDTH, GAME_HEIGHT);
            sManager.popState();
            if (this.endCondition === "Victory") {
                if (this.nextState === "scene") {
                    sManager.pushState(new Cutscene(this.context2, +this.nextID, this.mapID));
                }
            }
            else if (this.endCondition === "Defeat") {
                //game over
                sManager.pushState(new Title(this.context2));
            }
        }
    }
}