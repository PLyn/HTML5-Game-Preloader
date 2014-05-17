﻿///<reference path='State.ts' />
module Game {
    export class StatusMenu extends State {
        mx;
        my;
        menuItems;
        context;
        //used as the base class to be extended for each state
        //might need some initialization code to remove some clutter
        //from each state to make stuff look better
        constructor(ctx) {
            super();
            //ctx.fillStyle = "rgba(0, 0, 0, 0.6)";
            //ctx.fillRect(0, 0, 650, 600);
            this.context = ctx;

            this.menuItems = [];
            this.menuItems.push({
                "name": "back",
                "x": 40,
                "y": 490,
                "w": 80,
                "h": 70 
            });
            this.menuItems.push({
                "name": "equip",
                "x": 485,
                "y": 175,
                "w": 150,
                "h": 40 
            });
            this.menuItems.push({
                "name": "formation",
                "x": 485,
                "y": 235,
                "w": 150,
                "h": 40 
            });
            this.menuItems.push({
                "name": "inventory",
                "x": 485,
                "y": 120,
                "w": 150,
                "h": 40 
            });
            this.menuItems.push({
                "name": "status",
                "x": 485,
                "y": 285,
                "w": 150,
                "h": 40 
            });
            this.menuItems.push({
                "name": "setting",
                "x": 485,
                "y": 345,
                "w": 150,
                "h": 40 
            });
            this.menuItems.push({
                "name": "save",
                "x": 485,
                "y": 400,
                "w": 150,
                "h": 40 
            });
        }
        init() {
            this.context.drawImage(IMAGE_CACHE['status'], 0, 100);
            this.context.drawImage(IMAGE_CACHE['back'], 40, 490);
        }
        update() {
            if (mousedown) {
                this.mx = mEvent.pageX;
                this.my = mEvent.pageY;
                for (var x = 0; x < this.menuItems.length; x++) {
                    var x1 = this.menuItems[x].x;
                    var x2 = this.menuItems[x].x + this.menuItems[x].w;
                    var y1 = this.menuItems[x].y;
                    var y2 = this.menuItems[x].y + this.menuItems[x].h;
                    if ((x1 <= this.mx && this.mx <= x2) && (y1 <= this.my && this.my <= y2)) {
                        switch (this.menuItems[x].name) {
                            case "back":
                                sManager.popState();
                                break;
                            case "inventory":
                                sManager.pushState(new Inventory(this.context));
                                break;
                            case "equip":
                                sManager.pushState(new Equip(this.context));
                                break;
                            case "formation":
                                sManager.pushState(new Formation(this.context));
                                break;
                            case "status":
                                sManager.pushState(new Status(this.context));
                                break;
                            case "setting":
                                sManager.pushState(new Setting(this.context));
                                break;
                            case "save":
                                break;
                            default:
                                break;
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