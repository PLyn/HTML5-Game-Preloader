﻿window.onload = function () {
    var game = new Game.Init();
};
//deal with this function later to do proper coordinates for mouse position in canvas, not as important
//atm due to the fact that the entire game is on a empty page so the coordinates work so far but if there are
//more headers and divs or spans, the coordinates could become very inaccurate and have weird effects
//so keep this around for future reference when i need to tackle this issue
/*
function relMouseCoords(event) {
var totalOffsetX = 0;
var totalOffsetY = 0;
var canvasX = 0;
var canvasY = 0;
var currentElement = this;
do {
totalOffsetX += currentElement.offsetLeft - currentElement.scrollLeft;
totalOffsetY += currentElement.offsetTop - currentElement.scrollTop;
}
while(currentElement === currentElement.offsetParent)
canvasX = event.pageX - totalOffsetX;
canvasY = event.pageY - totalOffsetY;
return { x: canvasX, y: canvasY }
}
*/
var SCENE;
var EX;
var startScene;
var Game;
(function (Game) {
    var GenericArea = (function () {
        //make this as the name suggests, a more generic class for other classes to build on
        //to create "scenes" physcially such as the palce, music etc for the dialogue scenes and exploration aspects
        //most of the specific code will be removed and put somewhere else like in the states
        function GenericArea(ctx, w) {
            this.prevState = 0;
            this.update = function () {
                sManager.updateStack();
            };
            this.x = 0;
            this.y = 0;
            this.mx = 0;
            this.my = 0;
            this.velocity = 2.0;
            GAME_OBJECTS.push(SPRITE_CACHE[0]);

            /*SCENE = new Cutscene("scene", 800, 600, ctx);
            EX = new Explore(ctx, w);*/
            this.ctx = ctx;
            startScene = true;
            sManager.pushState(new Game.Explore(ctx, w, 'rpg', this));
        }
        GenericArea.prototype.render = function (context) {
            /*ANIM_CACHE['at'][pos].render(context, 200, 150);
            pos = (pos + 1) % ANIM_CACHE['at'].length;*/
        };
        GenericArea.prototype.endLevel = function (ctx) {
        };
        return GenericArea;
    })();
    Game.GenericArea = GenericArea;
})(Game || (Game = {}));
var __extends = this.__extends || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
};
///<reference path='genericArea.ts' />
var Game;
(function (Game) {
    var Area1 = (function (_super) {
        __extends(Area1, _super);
        function Area1(ctx, w) {
            _super.call(this, ctx, w);
            this.update = function () {
                sManager.updateStack();
            };
            sManager.pushState(new Game.Explore(ctx, w, 'rpg', this));
        }
        return Area1;
    })(Game.GenericArea);
    Game.Area1 = Area1;
})(Game || (Game = {}));
///<reference path='genericArea.ts' />
var Game;
(function (Game) {
    var Area2 = (function (_super) {
        __extends(Area2, _super);
        function Area2(ctx, w) {
            _super.call(this, ctx, w);
            this.update = function () {
                sManager.updateStack();
            };
            this.ctx = ctx;
            this.stateManger = new Game.StateManager();
            this.stateManger.pushState(new Game.Explore(ctx, w, 'rpg', this));
        }
        Area2.prototype.endLevel = function (ctx) {
            this.stateManger.pushState(new Game.Cutscene("id", 800, 600, this.ctx, '2'));
        };
        return Area2;
    })(Game.GenericArea);
    Game.Area2 = Area2;
})(Game || (Game = {}));
var Game;
(function (Game) {
    var Dialogue = (function () {
        //only major issue or feature i can think of left for this module is the text appearing as time goes on
        //like i did in the phaser dialogue module, should be relatively easy to implement with the logic from
        //the phaser project
        //There is also the creation of a new canvas for the dialog to appear on but that will be taken
        //care of in the state system since the canvas should probably be created there
        function Dialogue(ctx, cwidth) {
            var _this = this;
            this.lines = [];
            this.linePos = 0;
            this.time = 0;
            this.currentTime = 0;
            this.lineHeight = 1;
            this.startScene = function (key, tagName, index) {
                _this.dialogueObject = XML_CACHE[key].getElementsByTagName(tagName)[index];
                _this.lines = wrap(_this.ctx, _this.canvasWidth, _this.dialogueObject);
                _this.prevName = _this.lines[_this.linePos].name;
                _this.ctx.fillText(_this.lines[_this.linePos].message, 150, (300 + _this.lineHeight));
                _this.ctx.fillText(_this.lines[_this.linePos].name, 50, 250);
                _this.linePos++;
            };
            this.updateScene = function () {
                _this.currentTime = Date.now();
                if (_this.linePos < _this.lines.length && _this.currentTime > _this.time) {
                    _this.time = _this.currentTime + 1000;
                    if (_this.prevName !== _this.lines[_this.linePos].name) {
                        _this.ctx.clearRect(0, 0, 800, 600);
                        _this.prevName = _this.lines[_this.linePos].name;
                        _this.lineHeight = 1;
                    } else {
                        _this.lineHeight += 25;
                    }
                    _this.ctx.fillText(_this.lines[_this.linePos].message, 150, (300 + _this.lineHeight));
                    _this.ctx.fillText(_this.lines[_this.linePos].name, 50, 250);
                    _this.linePos++;
                } else if (_this.linePos >= _this.lines.length) {
                    //this.area.endLevel();
                    _this.ctx.clearRect(0, 0, 800, 600);
                    sManager.popState();
                }
            };
            this.ctx = ctx;
            this.canvasWidth = cwidth;
            this.setStyle('Calibri', '16pt', 'blue', 'bold', 'italic', 'left');
        }
        Dialogue.prototype.setStyle = function (font, size, color, bold, italic, align) {
            var bolded = bold || '';
            var ital = italic || '';
            this.ctx.font = bolded + ' ' + ital + ' ' + size + ' ' + font;
            this.ctx.fillStyle = color;
            this.ctx.textAlign = align;
        };
        return Dialogue;
    })();
    Game.Dialogue = Dialogue;
})(Game || (Game = {}));
var GAME_OBJECTS = [];
var Game;
(function (Game) {
    var GameObject = (function () {
        //pretty much complete imo, other classes such as sprite will extend the variables and functionality
        function GameObject(img, x, y, w, h, scale) {
            this.x = 0;
            this.y = 0;
            this.W = 0;
            this.H = 0;
            this.img = new Image();
            this.scale = 0;
            this.img = img;
            this.x = x || 0;
            this.y = y || 0;
            this.W = w;
            this.H = h;
            this.scale = scale || 1;
        }
        GameObject.prototype.update = function () {
        };
        GameObject.prototype.render = function (context, x, y) {
            context.drawImage(this.img, this.x, this.y, this.W, this.H, x, y, this.W * this.scale, this.H * this.scale);
        };
        return GameObject;
    })();
    Game.GameObject = GameObject;
})(Game || (Game = {}));
///<reference path='gameobject.ts' />
var Game;
(function (Game) {
    var Sprite = (function (_super) {
        __extends(Sprite, _super);
        //all the base attributes and methods are to be added here, this will come when
        //the battle system is being developed but for now it stays relatively empty i guess
        //until i sort out more pressing issues such as the state system
        function Sprite(img, x, y, w, h, a, scale) {
            _super.call(this, img, x, y, w, h, scale);
            this.a = a; //testing, not actually used for anything
        }
        return Sprite;
    })(Game.GameObject);
    Game.Sprite = Sprite;
})(Game || (Game = {}));
var Game;
(function (Game) {
    var input = (function () {
        function input(canvas) {
            //fairly complete for the tasks it need to do but might need some refining to the key functions to let it operate
            //as accurately as i need. Not a high priority as it works but look at later on.
            this.keys = [];
            this.click = false;
            this.mEvent = null;
            var that = this;
            document.addEventListener('keydown', function (e) {
                var letter = String.fromCharCode(e.keyCode);
                that.keys[letter] = true;
                console.log(letter);
            });
            document.addEventListener('keyup', function (e) {
                var letter = String.fromCharCode(e.keyCode);
                that.keys[letter] = false;
            });
            document.addEventListener('mousedown', function (e) {
                that.mEvent = e;
                that.click = true;
            });
            document.addEventListener('mouseup', function (e) {
                that.click = false;
            });
        }
        input.prototype.keydown = function (key) {
            return this.keys[key];
        };
        input.prototype.keyup = function (key) {
            return !this.keys[key];
        };
        input.prototype.mousedown = function () {
            return this.click;
        };
        return input;
    })();
    Game.input = input;
})(Game || (Game = {}));
/*      HTML5 AssetManager V. 0.95
*   Currently supports images, Atlases(from texturepacker) for sprites or animation, tilesets, xmls and sounds for now
*   how to use:
*/
var ANIM_CACHE = [];
var IMAGE_CACHE = [];
var SPRITE_CACHE = [];
var TILESET_CACHE = [];
var TILEDATA_CACHE = [];
var XML_CACHE = [];
var SOUND_CACHE = [];
var MUSIC_CACHE = [];

var Game;
(function (Game) {
    var Preloader = (function () {
        function Preloader() {
            var _this = this;
            this.animSource = new Image();
            this.animkey = [];
            this.animPos = 0;
            this.height = 0;
            this.isError = 0;
            this.isLoaded = 0;
            this.numTilesX = 0;
            this.numTilesY = 0;
            this.pixelSizeX = 0;
            this.pixelSizeY = 0;
            this.scale = 0;
            this.sprite = new Image();
            this.spritekey = [];
            this.spritePos = 0;
            this.spriteSource = new Image();
            this.isFilesLoaded = false;
            this.tilesetPos = 0;
            this.tileSizeX = 0;
            this.tileSizeY = 0;
            this.totalAssets = 0;
            this.width = 0;
            this.x = 0;
            this.y = 0;
            this.onAnimJSONLoad = function (key, response) {
                var holder = [];
                var frame;
                _this.animData = JSON.parse(response);

                _this.animSource.onload = function () {
                    _this.isLoaded++;
                };
                _this.animSource.src = 'Assets/Atlas/' + _this.animData.meta.image;
                for (var i = 0; i < _this.animData.frames.length; i++) {
                    frame = _this.animData.frames[i].frame;
                    holder[i] = new Game.GameObject(_this.spriteSource, frame.x, frame.y, frame.w, frame.h);
                }
                ANIM_CACHE[key[_this.animPos]] = holder; //Store the holder array into the key of the ANIM_CACHE
                _this.animPos++; //Move to the next key of the array
            };
            this.onSpriteJSONLoad = function (key, response) {
                var holder = [];

                _this.spriteData = JSON.parse(response);
                _this.spriteSource.onload = function () {
                    _this.isLoaded++;
                };
                _this.spriteSource.src = 'Assets/Atlas/' + _this.spriteData.meta.image;
                for (var i = 0; i < _this.spriteData.frames.length; i++) {
                    var frame = _this.spriteData.frames[i].frame;

                    //figure out whats wrong with the associative array
                    var indexes = _this.spriteData.frames[i].filename.substring(0, _this.spriteData.frames[i].filename.length - 4);
                    holder[i] = new Game.GameObject(_this.spriteSource, frame.x, frame.y, frame.w, frame.h);
                    SPRITE_CACHE[i] = holder[i];
                }
                _this.spritePos++;
            };
            this.onTileJSONLoad = function (key, response) {
                _this.tiledData = JSON.parse(response);
                _this.numTilesX = _this.tiledData.width;
                _this.numTilesY = _this.tiledData.height;
                _this.tileSizeX = _this.tiledData.tilewidth;
                _this.tileSizeY = _this.tiledData.tileheight;
                _this.pixelSizeX = _this.numTilesX * _this.tileSizeX;
                _this.pixelSizeY = _this.numTilesY * _this.tileSizeY;

                var tiledata = _this.tiledData.tilesets;
                for (var i = 0; i < tiledata.length; i++) {
                    var tilesetimage = new Image();
                    tilesetimage.onload = function () {
                        _this.isLoaded++;
                    };
                    tilesetimage.src = "../Assets/Tilemap/" + _this.tiledData.tilesets[i].image.replace(/^.*[\\\/]/, '');
                    var tileData = {
                        "firstgid": tiledata[i].firstgid,
                        "image": tilesetimage,
                        "imageheight": tiledata[i].imageheight,
                        "imagewidth": tiledata[i].imagewidth,
                        "name": tiledata[i].name,
                        "numXTiles": Math.floor(tiledata[i].imagewidth / _this.tileSizeX),
                        "numYTiles": Math.floor(tiledata[i].imageheight / _this.tileSizeY)
                    };
                    TILESET_CACHE[key[_this.tilesetPos]] = tileData;
                    TILEDATA_CACHE[key[_this.tilesetPos]] = _this.tiledData;
                    _this.tilesetPos++;
                    _this.tileKey = key; //needed for getTile ()
                }
            };
            this.onXMLLoad = function (key, response) {
                XML_CACHE[key] = response;
                _this.isLoaded++;
                //rest to be implemented. not sure how to extract the info how i want yet...will do soon
                //saved xml file iin the global variable to be used later on as needed
            };
        }
        Preloader.prototype.queueAssets = function (Assets, load) {
            var _this = this;
            var Assetkeys = Object.keys(Assets);
            for (var x = 0; x < Assetkeys.length; x++) {
                var itemkeys = Object.keys(Assets[Assetkeys[x]]);
                for (var y = 0; y < itemkeys.length; y++) {
                    this.totalAssets++;
                }
            }
            if (Assets.Images) {
                this.genericLoader(Assets.Images, true);
            }
            if (Assets.Anim) {
                this.genericLoader(Assets.Anim, false, this.animkey, this.onAnimJSONLoad, 'json');
            }
            if (Assets.Sprite) {
                this.genericLoader(Assets.Sprite, false, this.spritekey, this.onSpriteJSONLoad, 'json');
            }
            if (Assets.Tileset) {
                this.genericLoader(Assets.Tileset, false, this.tileKey, this.onTileJSONLoad, 'json');
            }
            if (Assets.XML) {
                this.genericLoader(Assets.XML, false, this.xmlKey, this.onXMLLoad, 'xml');
            }
            if (Assets.Sounds) {
                this.soundloader(Assets.Sounds, 'Sound');
            }
            if (Assets.Music) {
                this.soundloader(Assets.Music, 'Music');
            }
            this.timerid = setInterval(function () {
                if (_this.isLoaded === _this.totalAssets) {
                    clearInterval(_this.timerid);
                    _this.isFilesLoaded = true;
                    load();
                }
            }, 1000 / 2);
        };
        Preloader.prototype.genericLoader = function (url, isImage, key, onLoad, typeOfFile) {
            if (isImage) {
                for (var file in url) {
                    IMAGE_CACHE[file] = new Image();
                    IMAGE_CACHE[file].onload = this.isLoaded++;
                    IMAGE_CACHE[file].onerror = this.isError++;
                    IMAGE_CACHE[file].src = url[file];
                }
            } else {
                key = Object.keys(url);
                for (var i = 0; i < key.length; i++) {
                    this.loadfile(key, url[key[i]], onLoad, typeOfFile);
                }
            }
        };
        Preloader.prototype.soundloader = function (sounds, type) {
            var _this = this;
            var pos;
            var key = Object.keys(sounds);
            var audioType = '';
            for (pos = 0; pos < key.length; pos++) {
                if (type === 'Sound') {
                    SOUND_CACHE[key[pos]] = document.createElement("audio");
                    document.body.appendChild(SOUND_CACHE[key[pos]]);
                    audioType = this.soundFormat(SOUND_CACHE[key[pos]]);
                    SOUND_CACHE[key[pos]].setAttribute("src", sounds[key[pos]] + audioType);
                    SOUND_CACHE[key[pos]].load();
                    SOUND_CACHE[key[pos]].addEventListener('canplaythrough', function () {
                        _this.isLoaded++;
                    });
                } else if (type === 'Music') {
                    MUSIC_CACHE[key[pos]] = document.createElement("audio");
                    document.body.appendChild(MUSIC_CACHE[key[pos]]);
                    audioType = this.soundFormat(MUSIC_CACHE[key[pos]]);
                    MUSIC_CACHE[key[pos]].setAttribute("src", sounds[key[pos]] + audioType);
                    MUSIC_CACHE[key[pos]].load();
                    MUSIC_CACHE[key[pos]].addEventListener('canplaythrough', function () {
                        _this.isLoaded++;
                    });
                }
            }
        };
        Preloader.prototype.soundFormat = function (audioElement) {
            var ext = '';
            if (audioElement.canPlayType("audio/ogg") === "probably" || audioElement.canPlayType("audio/ogg") === "maybe") {
                ext = '.ogg';
            } else if (audioElement.canPlayType("audio/mp3") === "probably" || audioElement.canPlayType("audio/mp3") === "maybe") {
                ext = '.mp3';
            }
            return ext;
        };
        Preloader.prototype.loadfile = function (key, url, onLoad, type) {
            var xobj = new XMLHttpRequest();
            xobj.open('GET', url, true);
            xobj.onreadystatechange = function () {
                if (xobj.readyState == 4 && xobj.status == 200) {
                    if (type === 'json') {
                        onLoad(key, xobj.responseText);
                    } else if (type === 'xml') {
                        onLoad(key, xobj.responseXML);
                    } else if (type === 'mp3') {
                        onLoad(key, xobj.response);
                    }
                }
            };
            xobj.send(null);
        };
        return Preloader;
    })();
    Game.Preloader = Preloader;
})(Game || (Game = {}));
var Game;
(function (Game) {
    var StateManager = (function () {
        /*currentInGameState = 0;
        currentInGameStateFunction = null;
        currentState = 0;
        currentStateFunction = null;*/
        //Mostly guesswork here, I am assuming none of this code will make it to the final thing
        //High on the list, will start getting through this ASAP with help from nick and/or the book
        function StateManager() {
            this.gameStates = [];
            this.stateStack = new Array();
        }
        StateManager.prototype.addState = function (key, state) {
            this.gameStates[key] = state;
            //this.stateStack.push(state);
            //state.init();
        };
        StateManager.prototype.pushState = function (state) {
            this.stateStack.push(state);
            state.init();
            //this.stateStack.push(this.gameStates[key]);
            //this.gameStates[key].init();
        };
        StateManager.prototype.popState = function () {
            if (this.stateStack.length > 0) {
                this.stateStack.pop();
                if (this.stateStack.length > 0) {
                    var len = this.stateStack.length;
                    this.stateStack[len - 1].init();
                }
            }
        };
        StateManager.prototype.updateStack = function () {
            var len = this.stateStack.length;
            this.stateStack[len - 1].update();
        };
        StateManager.prototype.renderStack = function () {
            for (var s in this.stateStack) {
                s.render();
            }
        };
        return StateManager;
    })();
    Game.StateManager = StateManager;
})(Game || (Game = {}));
var objects = [];
var Game;
(function (Game) {
    var Tilemap = (function () {
        function Tilemap() {
            var _this = this;
            this.setTileset = function (context, index) {
                for (var layeridX = 0; layeridX < TILEDATA_CACHE[index].layers.length; layeridX++) {
                    if (TILEDATA_CACHE[index].layers[layeridX].type === "tilelayer") {
                        var data = TILEDATA_CACHE[index].layers[layeridX].data;
                        for (var tileidX = 0; tileidX < data.length; tileidX++) {
                            var ID = data[tileidX];
                            if (ID === 0) {
                                continue;
                            }
                            var tileloc = _this.getTile(ID);

                            var worldX = Math.floor(tileidX % TILEDATA_CACHE[index].width) * TILEDATA_CACHE[index].tilewidth;
                            var worldY = Math.floor(tileidX / TILEDATA_CACHE[index].width) * TILEDATA_CACHE[index].tileheight;

                            _this.tileimg = tileloc.img;
                            _this.tilepx = tileloc.px;
                            _this.tilepy = tileloc.py;
                            _this.tilewidth = TILEDATA_CACHE[index].tilewidth;
                            _this.tileheight = TILEDATA_CACHE[index].tileheight;
                            _this.worldx = worldX;
                            _this.worldy = worldY;

                            context.drawImage(tileloc.img, tileloc.px, tileloc.py, TILEDATA_CACHE[index].tilewidth, TILEDATA_CACHE[index].tileheight, worldX, worldY, TILEDATA_CACHE[index].tilewidth, TILEDATA_CACHE[index].tileheight);
                        }
                    } else if (TILEDATA_CACHE[index].layers[layeridX].type === "objectgroup") {
                        var tileObjects = TILEDATA_CACHE[index].layers[layeridX].objects;
                        var obj = {
                            "name": "",
                            "width": 0,
                            "x": 0,
                            "y": 0
                        };

                        for (var x = 0; x < tileObjects.length; x++) {
                            var tile = _this.getTile(tileObjects[x].gid);
                            if (tileObjects[x].width !== 0) {
                                obj.width = tileObjects[x].width;
                            } else {
                                obj.width = 32; //TILEDATA_CACHE[index].tilesets.tilewidth;
                            }
                            obj.name = tileObjects[x].name;
                            obj.x = tileObjects[x].x;
                            obj.y = tileObjects[x].y;
                            objects[x] = {
                                "name": obj.name,
                                "width": obj.width,
                                "x": obj.x,
                                "y": obj.y
                            };

                            var w = TILEDATA_CACHE[index].tilewidth;
                            var h = TILEDATA_CACHE[index].tileheight;
                            _this.objimg = tile.img;
                            _this.objpx = tile.px;
                            _this.objpy = tile.py;
                            _this.objx = obj.x;
                            _this.objy = obj.y;

                            context.drawImage(tile.img, tile.px, tile.py, w, h, obj.x, obj.y, w, h);
                        }
                    }
                }
            };
            this.drawMap = function (mapcontext, objcontext) {
                mapcontext.drawImage(_this.tileimg, _this.tilepx, _this.tilepy, _this.tilewidth, _this.tileheight, _this.worldx, _this.worldy, _this.tilewidth, _this.tileheight); //draw map
                objcontext.drawImage(_this.objimg, _this.objpx, _this.objpy, _this.objw, _this.objh, _this.objx, _this.objy, _this.objw, _this.objh); //draw objects
            };
        }
        Tilemap.prototype.Init = function () {
            this.key = [];
            this.key = Object.keys(TILESET_CACHE);
        };

        //ALOT OF WORK LEFT TO DO HERE TO MAKE OBJECTS EASILY ALTERED and removed as needed
        //Functions to test if file are loaded and can be rendered properly
        Tilemap.prototype.getTile = function (tileIndex) {
            var tile = {
                "img": null,
                "px": 0,
                "py": 0
            };

            var i = 0;
            for (i = 0; i < this.key.length; i--) {
                if (TILESET_CACHE[this.key[i]].firstgid <= tileIndex)
                    break;
            }
            tile.img = TILESET_CACHE[this.key[i]].image;
            var localIndex = tileIndex - TILESET_CACHE[this.key[i]].firstgid;
            var localtileX = Math.floor(localIndex % TILESET_CACHE[this.key[i]].numXTiles);
            var localtileY = Math.floor(localIndex / TILESET_CACHE[this.key[i]].numXTiles);
            tile.px = localtileX * TILEDATA_CACHE[this.key[i]].tilewidth;
            tile.py = localtileY * TILEDATA_CACHE[this.key[i]].tileheight;

            return tile;
        };
        return Tilemap;
    })();
    Game.Tilemap = Tilemap;
})(Game || (Game = {}));
var control;
var tiles;
var Game;
(function (Game) {
    var Loop = (function () {
        //remove alot of initialization code from here as it will go in the states
        //need to put the code in here to deal with the states as needed thoughs
        function Loop(canvasid, width, height, preloader) {
            var _this = this;
            this.render = function () {
                _this.currentArea.render(_this.context);
            };
            /*this.canvas = document.createElement('canvas');
            this.canvas.id = canvasid;
            this.canvas.width = width;
            this.canvas.height = height;
            this.canvas.tabindex = '1';
            document.body.appendChild(this.canvas);*/
            this.asset = preloader;
            this.canvas = document.getElementById('layer1');
            this.context = this.canvas.getContext('2d');
            this.canvas2 = document.getElementById('layer2');
            this.context2 = this.canvas.getContext('2d');
            control = new Game.input(this.canvas2);
            tiles = new Game.Tilemap();
            tiles.Init();
            this.currentArea = new Game.Area1(this.context, width);
        }
        Loop.prototype.update = function () {
            this.currentArea.update();
        };

        Loop.prototype.playerInput = function () {
        };
        return Loop;
    })();
    Game.Loop = Loop;
})(Game || (Game = {}));
var pos = 0;
var audioElement = new Audio();
var WORLD = 0;
var sManager;

//State system core will most likely be here so read the book and figure out
//how to get it working and leading to each state as needed
var Game;
(function (Game) {
    var Init = (function () {
        function Init() {
            var _this = this;
            this.onComplete = function () {
                //this.dialog = new Game.Cutscene("dia", 800, 600);
                _this.world = new Game.Loop('canvas', 800, 600, _this.preloader);
                setInterval(_this.GameLoop, 1000 / 30);
            };
            this.GameLoop = function () {
                _this.world.update();
                _this.world.render();
                //this.world.update();
                //this.world.render();
            };
            var source = {
                Images: {
                    D: 'Assets/Image/diamond.png',
                    S: 'Assets/Image/star.png'
                },
                Anim: {
                    at: 'Assets/Atlas/test.json'
                },
                Sprite: {
                    spr: 'Assets/Atlas/test.json'
                },
                Tileset: {
                    rpg: 'Assets/Tilemap/map.json'
                },
                XML: {
                    chapter: 'Assets/XML/test.xml'
                },
                Sounds: {
                    car: 'Assets/Sound/car',
                    punch: 'Assets/Sound/punch',
                    wood: 'Assets/Sound/wood'
                },
                Music: {
                    theme: 'Assets/Music/theme'
                }
            };
            this.preloader = new Game.Preloader();
            this.preloader.queueAssets(source, this.onComplete);
            sManager = new Game.StateManager();
        }
        return Init;
    })();
    Game.Init = Init;
})(Game || (Game = {}));
var Game;
(function (Game) {
    var State = (function () {
        //used as the base class to be extended for each state
        //might need some initialization code to remove some clutter
        //from each state to make stuff look better
        function State() {
        }
        State.prototype.init = function () {
        };
        State.prototype.update = function () {
        };
        State.prototype.render = function () {
        };
        State.prototype.pause = function () {
        };
        State.prototype.resume = function () {
        };
        State.prototype.destroy = function () {
        };
        return State;
    })();
    Game.State = State;
})(Game || (Game = {}));
///<reference path='State.ts' />
var Game;
(function (Game) {
    var Cutscene = (function (_super) {
        __extends(Cutscene, _super);
        function Cutscene(id, width, height, ctx, xmlID) {
            _super.call(this);
            this.canvas = document.getElementById('layer2');
            this.context = this.canvas.getContext('2d');
            this.xml = xmlID;
            this.dia = new Game.Dialogue(this.context, width);
        }
        Cutscene.prototype.init = function () {
            this.dia.startScene('chapter', 'scene', this.xml);
        };

        Cutscene.prototype.update = function () {
            if (control.mousedown()) {
                this.dia.updateScene();
            }
        };
        Cutscene.prototype.render = function () {
        };
        Cutscene.prototype.pause = function () {
        };
        Cutscene.prototype.resume = function () {
        };
        Cutscene.prototype.destroy = function () {
        };
        return Cutscene;
    })(Game.State);
    Game.Cutscene = Cutscene;
})(Game || (Game = {}));
///<reference path='State.ts' />
var Game;
(function (Game) {
    var Explore = (function (_super) {
        __extends(Explore, _super);
        function Explore(ctx, w, mapID, area) {
            _super.call(this);
            this.x = 0;
            this.y = 0;
            this.mx = 0;
            this.my = 0;
            this.velocity = 2.0;

            this.currentArea = area;
            this.mapID = mapID;
            var canvas = document.getElementById('layer2');
            this.layer2ctx = canvas.getContext('2d');

            var canvas2 = document.getElementById('layer1');
            this.layer1ctx = canvas2.getContext('2d');
        }
        Explore.prototype.init = function () {
            this.layer1ctx.clearRect(0, 0, 800, 600);
            this.layer2ctx.clearRect(0, 0, 800, 600);
            tiles.setTileset(this.layer1ctx, this.mapID);
            //tiles.drawMap(this.layer1ctx, this.layer2ctx);
            /*tiles.drawTiles(this.layer1ctx, 'rpg');
            tiles.getObjects(this.layer2ctx, 'rpg');*/
            //tiles.getObjects(this.layer1ctx, 'rpg');
            //GAME_OBJECTS[0].render(this.layer2ctx, this.x, this.y);
        };
        Explore.prototype.update = function () {
            if (control.mousedown()) {
                this.mx = control.mEvent.pageX;
                this.my = control.mEvent.pageY;
                for (var i = 0; i < objects.length; i++) {
                    var x1 = objects[i].x;
                    var x2 = objects[i].x + objects[i].width;
                    var y1 = objects[i].y;
                    var y2 = objects[i].y + objects[i].width;
                    if ((x1 <= this.mx && this.mx <= x2) && (y1 <= this.my && this.my <= y2)) {
                        sManager.pushState(new Game.Cutscene("id", 800, 600, this.layer2ctx, objects[i].name));

                        console.log(objects[i].name);
                        //this.currentArea.endLevel(this.layer2ctx);
                        //sManager.pushState(new Cutscene("id", 800, 600, this.layer2ctx, '1', this));
                    }
                }
            }
        };
        Explore.prototype.render = function () {
        };
        Explore.prototype.pause = function () {
        };
        Explore.prototype.resume = function () {
        };
        Explore.prototype.destroy = function () {
        };
        return Explore;
    })(Game.State);
    Game.Explore = Explore;
})(Game || (Game = {}));
function wrap(ctx, cwidth, text) {
    var templine = "";
    var lines = [];
    var child = text.childNodes;

    for (var i = 0; i < text.childNodes.length; i++) {
        if (child[i].nodeType === 1) {
            if (ctx.measureText(child[i].textContent).width >= cwidth) {
                var words = child[i].textContent.split(' ');
                for (var key = 0; key < words.length; key++) {
                    var length = templine.length;
                    var word = words[key];
                    templine = templine + word + ' ';
                    if (ctx.measureText(templine).width >= (cwidth * 0.85)) {
                        lines.push({ "name": child[i].nodeName, "message": templine.substring(0, length) });
                        key--;
                        templine = "";
                    } else if (ctx.measureText(templine).width >= (cwidth * 0.70)) {
                        lines.push({ "name": child[i].nodeName, "message": templine });
                        templine = "";
                    }
                }
                lines.push({ "name": child[i].nodeName, "message": templine });
            } else {
                lines.push({ "name": child[i].nodeName, "message": child[i].textContent });
            }
        }
    }
    return lines;
}
//# sourceMappingURL=app.js.map
