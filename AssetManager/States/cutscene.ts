﻿///<reference path='State.ts' />
module Game {
    export class Cutscene extends State {
        dia;
        canvas;
        canvas2;
        context;
        context2;
        ctl;
        xmlID;

        node;
        currentNode;
        lines = [];
        ctx;
        linePos = 0;
        time = 0;
        currentTime = 0;
        prevName;
        lineHeight = 1;
        initNode = true;
        nCounter = 0;
        nodeCount = 0;
        textNodes = [];
        sfx;
        anim;
        animate;
        mapID;
        constructor(ctx, xmlID, mapID) {
            super();
            this.canvas = <HTMLCanvasElement> document.getElementById('layer2');
            this.context = this.canvas.getContext('2d');
            this.canvas2 = <HTMLCanvasElement> document.getElementById('layer1');
            this.context2 = this.canvas.getContext('2d');
            this.xmlID = xmlID;
            this.mapID = mapID;
        }
        init() {
            this.initNode = true;
            this.node = XML_CACHE['chapter'].getElementsByTagName('scene')[this.xmlID];
            var count = 0;
            for (var x = 0; x < this.node.childNodes.length; x++) {
                if (this.node.childNodes[x].nodeType === 1) {
                    this.textNodes[count] = this.node.childNodes[x];
                    count++;
                    this.nodeCount++;
                }
            }
            this.currentNode = this.textNodes[this.nCounter];
            //this.lines = wrap(this.context, this.canvasWidth, this.dialogueObject);
            //this.prevName = this.lines[this.linePos].name;
        }
        nextNode() {
            this.nCounter++;
            this.currentNode = this.textNodes[this.nCounter];
            /*if (this.nCounter >= this.nodeCount) {
                sManager.popState();
            }*/
        }
        update() {
            this.currentTime = Date.now();
            switch (this.currentNode.getAttribute('type')) {
                case "dialog":
                    if (this.initNode) {
                        setStyle(this.context, 'Calibri', '16pt', 'white', 'bold', 'italic', 'left');
                        this.linePos = 0;
                        this.lineHeight = 1;
                        this.lines = wrap(this.context, this.currentNode);
                        this.prevName = this.lines[this.linePos].name;
                        this.initNode = false;
                        this.context.drawImage(IMAGE_CACHE['dialog'], 25, 350);

                        this.time = this.currentTime + 500;
                        if (this.prevName !== this.lines[this.linePos].name) {
                            this.context.clearRect(0, 0, 800, 600);
                            this.prevName = this.lines[this.linePos].name;
                            this.lineHeight = 1;
                            this.context.drawImage(IMAGE_CACHE['dialog'], 25, 350);
                        }
                        else if (this.linePos >= 1) {
                            this.lineHeight += 25;
                        }
                        this.context.fillText(this.lines[this.linePos].message, 50, (425 + this.lineHeight));
                        this.context.fillText(this.lines[this.linePos].name, 30, 400);
                        this.linePos++;
                    }
                    if (this.linePos < this.lines.length && this.currentTime > this.time && mouseClicked()) {
                        this.time = this.currentTime + 500;
                        if (this.prevName !== this.lines[this.linePos].name) {
                            this.context.clearRect(0, 0, 800, 600);
                            this.prevName = this.lines[this.linePos].name;
                            this.lineHeight = 1;
                            this.context.drawImage(IMAGE_CACHE['dialog'], 25, 350);
                        }
                        else if (this.linePos >= 1) {
                            this.lineHeight += 25;
                        }
                        this.context.fillText(this.lines[this.linePos].message, 50, (425 + this.lineHeight));
                        this.context.fillText(this.lines[this.linePos].name, 30, 400);
                        this.linePos++;
                    }
                    else if (this.linePos >= this.lines.length && this.currentTime > this.time && mouseClicked()) {
                        this.initNode = true;
                        this.nextNode();
                    }
                    break;
                case "bg":
                    this.context.drawImage(IMAGE_CACHE[this.currentNode.nodeName], 0, 0);
                    this.nextNode();
                    break;
                case "party":
                    if (this.currentNode.getAttribute('value') === "add") {
                        PARTY.add(this.currentNode.nodeName, 0);
                    }
                    else if (this.currentNode.getAttribute('value') === "remove") {
                        PARTY.remove(this.currentNode.nodeName, 0);
                    }
                    //level up character to current level and add spells as well check if there is noone in the party here -TODO
                    this.nextNode();
                    break;
                case "ability":
                    if (this.currentNode.getAttribute('value') === "add") {
                        for (var i = 0; i < battleList.length; i++) {
                            if (battleList[i].Base.ID === this.currentNode.nodeName) break;
                        }
                        SPELL.AddSpell(battleList[i] , this.currentNode.getAttribute('spell'));
                    }
                    else if (this.currentNode.getAttribute('value') === "remove") {
                        for (var i = 0; i < battleList.length; i++) {
                            if (battleList[i].Base.ID === this.currentNode.nodeName) break;
                        }
                        SPELL.RemoveSpell(battleList[i], this.currentNode.getAttribute('spell'));
                    }
                    this.nextNode();
                    break;
                case "switch":
                    QUEST.Switch[this.currentNode.nodeName] = this.currentNode.getAttribute('value');
                    this.nextNode();
                    break;
                case "sfx":
                    if (this.initNode) {
                        this.sfx = SOUND_CACHE[this.currentNode.nodeName];
                        this.sfx.play();
                        this.initNode = false;
                    }
                    else if (this.sfx.ended) {
                        this.initNode = true;
                        this.nextNode();
                    }
                    break;
                case "move":
                    var sx; var sy; var dx; var dy;
                    var keys = Object.keys(objects);
                    for (var x = 0; x < keys.length; x++) {
                        if (this.currentNode.nodeName === objects[keys[x]].name) {
                            sx = objects[keys[x]].x;
                            sy = objects[keys[x]].y;
                            break;
                        }
                    }
                    dx = +this.currentNode.getAttribute('x');
                    dy = +this.currentNode.getAttribute('y');
                    var coords = moveSprite(this.context2, sx, sy, dx, dy);
                    objects[x].x = coords.x;
                    objects[x].y = coords.y;
                    this.context2.clearRect(0, 0, GAME_WIDTH, GAME_HEIGHT);
                    TileMap.drawMapNoObjectReset(this.context2, this.mapID);
                    this.nextNode();
                    break;
                case "object":
                    if (this.currentNode.getAttribute('value') === "add") {
                        var obj = {
                            "gid": 262,
                            "name": "Assassin",
                            "type": "",
                            "properties": {
                                "Type": 0,
                                "ID": 0
                            },
                            "width": 0,
                            "x": +this.currentNode.getAttribute('x') * 32,
                            "y": +this.currentNode.getAttribute('y') * 32
                        };
                        objects.push(obj);
                        this.context2.clearRect(0, 0, GAME_WIDTH, GAME_HEIGHT);
                        TileMap.drawMapNoObjectReset(this.context2, this.mapID);
                    }
                    else if (this.currentNode.getAttribute('value') === "remove") {
                        for (var x = 0; x < objects.length; x++) {
                            if (objects[x].name === this.currentNode.getAttribute('name')) {
                                break;
                            }
                        }
                        objects.splice(x, 1);
                    }
                    this.nextNode();
                    break;
                case "anim":
                    if (this.initNode) {
                        this.anim = ANIM_CACHE[this.currentNode.nodeName];
                        this.animate = new Animation(this.context);
                        this.animate.queueAnimation(this.anim);
                        this.animate.play();
                        this.initNode = false;
                    }
                    else if (this.animate.finishPlaying) {
                        this.initNode = true;
                        this.nextNode();
                    }
                    break;
                case "bgm":
                    var bgm = MUSIC_CACHE[this.currentNode.nodeName];
                    bgm.addEventListener('ended', function () {
                        this.currentTime = 0;
                        this.play();
                    }, false);
                    bgm.play();
                    this.nextNode();
                    break;
                case "item":
                    ITEM.add(this.currentNode.nodeName, this.currentNode.getAttribute('quantity'), this.currentNode.getAttribute('itemType'));
                    this.nextNode();
                    break;
                case "next":
                    var id = this.currentNode.getAttribute('id');
                    sManager.popState();
                    switch (this.currentNode.nodeName) {
                        case "explore":
                            sManager.pushState(new Explore(this.context, id));
                            break;
                        case "battle":
                            this.context.clearRect(0, 0, 800, 600);
                            this.context2.clearRect(0, 0, 800, 600);
                            sManager.pushState(new Battle(+id, this.mapID));
                            break;
                        case "dialog":
                            sManager.pushState(new Cutscene(this.context, +id, this.mapID));
                            break;
                        default:
                            break;
                    }
                    break;
                default:
                    break;
            }
        }
        render() {

        }
        pause() {

        }
        resume() {

        }
        destroy() {

        }
    }
}