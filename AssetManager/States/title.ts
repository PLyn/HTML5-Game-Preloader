﻿///<reference path='State.ts' />
module Game {
    export class Title extends State {
        context: CanvasRenderingContext2D;
        MenuItems;
        mx;
        my;
        width;
        constructor(ctx, w) {
            super();
            this.context = ctx;
            this.MenuItems = [];
            this.width = w;
            SAVE = new SaveSystem(ctx);
        }
        init() {
            this.context.drawImage(IMAGE_CACHE['ripple'], 0, 0);
            setStyle(this.context, 'Calibri', 25, "white", "bold");
            this.context.fillText("Ripples of War Alpha " + GAME_VERSION, 250, 100);
            this.context.fillText("New Game", 300, 300);
            this.context.fillText("Continue Game", 300, 350);

            this.MenuItems.push({
                "name": "new",
                "x": 300,
                "y": 300,
                "w": this.context.measureText("New Game").width,
                "h": 20
            });
            this.MenuItems.push({
                "name": "load",
                "x": 300,
                "y": 350,
                "w": this.context.measureText("Continue Game").width,
                "h": 20
            });

        }
        update() {
            if (mouseClicked()) {
                this.mx = mEvent.pageX;
                this.my = mEvent.pageY;
                for (var x = 0; x < this.MenuItems.length; x++) {
                    var x1 = this.MenuItems[x].x;
                    var x2 = this.MenuItems[x].x + this.MenuItems[x].w;
                    var y1 = this.MenuItems[x].y;
                    var y2 = this.MenuItems[x].y + this.MenuItems[x].h;
                    if ((x1 <= this.mx && this.mx <= x2) && (y1 <= this.my && this.my <= y2)) {
                        if (this.MenuItems[x].name === "new") {
                            this.context.clearRect(0, 0, 800, 600);
                            sManager.popState();
                            sManager.pushState(new Cutscene("id", 600, 200, this.context, 0));
                            //sManager.pushState(new Explore(this.context, this.width, 'rpg'));
                        }
                        else if (this.MenuItems[x].name === "load") {
                            if (localStorage.getItem("TileMap") === null || localStorage.getItem("Party") === null) {
                                this.context.fillText("No saved file detected. Please start a new Game", 100, 250);
                            }
                            else {
                                sManager.popState();
                                SAVE.load(this.width);
                            }
                        }
                    }
                }
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