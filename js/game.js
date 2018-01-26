
class GameObject {
    constructor(pos, texture, owner) {
        this.pos = pos;
        this.lastpos = pos;
        this.texture = texture;
        this.owner = owner;
    }

    tick(dt) {

    }

    getAbsolutePosition() {
        var absx = MathHelper.getInstance().lerp(
            this.lastpos.x,
            this.pos.x, 
            GlobalVars.getInstance().interpolation
        );
        var absy = MathHelper.getInstance().lerp(
            this.lastpos.y,
            this.pos.y,
            GlobalVars.getInstance().interpolation
        );

        return new Vector2D(
            absx,
            absy
        );
    }
};

class Enemy extends GameObject {
    constructor(pos, texture, owner) {
        super(pos, texture, owner);
        this.prototype = {
            tick: (dt) => this.tick(dt)
        };
        this.texture = texture;
        var spawnx = MathHelper.getInstance().generateRandom(1, this.owner.mapsize.x - 2);
        var spawny = MathHelper.getInstance().generateRandom(1, this.owner.mapsize.y - 2);

        console.log(this.owner);
        this.pos = new Vector2D(
            spawnx * this.owner.tilesize.x,
            spawny * this.owner.tilesize.y
        );

        this.lastpos = new Vector2D(
            this.pos.x,
            this.pos.y 
        );
        this.selectedtile = false;
        this.targettile = new Vector2D(0, 0);
        this.walkspeed = 500;
        this.path = [];
    }

    tick(dt) {
        if(GlobalVars.getInstance().gamestate == 1) return;
        this.lastpos = new Vector2D(this.pos.x, this.pos.y);
        if(this.selectedtile == false) {
            this.targettile = new Vector2D(
                MathHelper.getInstance().generateRandom(1, this.owner.mapsize.x - 2),
                MathHelper.getInstance().generateRandom(1, this.owner.mapsize.y - 2),
            );
            var currenttile = new Vector2D(
                Math.floor(this.pos.x / 32),
                Math.floor(this.pos.y / 32)
            );
    
            var self = this;
            if(currenttile.x != this.targettile.x || currenttile.y != this.targettile.y) {
                this.owner.pathfinder.findPath(currenttile.x, currenttile.y, this.targettile.x, this.targettile.y, function(path) {
                    if(path === null) {
                        console.log("PATH NOT FOUND");
                    } else {
                        self.path = path.slice(1);
                    }
                });
                this.owner.pathfinder.calculate();
                this.selectedtile = true;
            }
        } else {
            console.log("YO");
            if(this.path.length > 0) {
                var velocity = new Vector2D(
                    ((this.path[0].x * 32) - this.pos.x) / dt,
                    ((this.path[0].y * 32) - this.pos.y) / dt
                );
    
                if(velocity.length() > this.walkspeed) {
                    velocity.normalizeInPlace();
                    velocity = new Vector2D(
                        Math.floor(velocity.x * this.walkspeed),
                        Math.floor(velocity.y * this.walkspeed)
                    )
                }
    
                this.pos = new Vector2D(
                    this.pos.x + velocity.x * dt,
                    this.pos.y + velocity.y * dt 
                )
    
                if(this.pos.x == (this.path[0].x * 32) && this.pos.y == (this.path[0].y * 32)) {
                    this.path = this.path.slice(1);
                    if(this.path.length == 0) {
                        GlobalVars.getInstance().gamestate = 1;
                        this.lastpos = new Vector2D(this.pos.x, this.pos.y);
                        this.selectedtile = false;
                    }
                }    
            }
        }
    }
}
class Player extends GameObject {
    constructor(pos, texture, owner) {
        super(pos, texture, owner);
        this.prototype = {
            tick: (dt) => console.log("tick")
        };
        this.x = 0;
        this.y = 0;
        this.lastx = 0;
        this.lasty = 0;
        this.walkspeed = 350;
        this.targettile = new Vector2D(1, 1);
        this.path = [];
    }

    tick(dt) {
        if(GlobalVars.getInstance().gamestate == 0) return;
        this.lastpos = new Vector2D(this.pos.x, this.pos.y);
        if(this.path.length > 0) {
            var velocity = new Vector2D(
                ((this.path[0].x * 32) - this.pos.x) / dt,
                ((this.path[0].y * 32) - this.pos.y) / dt
            );

            if(velocity.length() > this.walkspeed) {
                velocity.normalizeInPlace();
                velocity = new Vector2D(
                    Math.floor(velocity.x * this.walkspeed),
                    Math.floor(velocity.y * this.walkspeed)
                )
            }

            this.pos = new Vector2D(
                this.pos.x + velocity.x * dt,
                this.pos.y + velocity.y * dt 
            )

            if(this.pos.x == (this.path[0].x * 32) && this.pos.y == (this.path[0].y * 32)) {
                this.path = this.path.slice(1);
                if(this.path.length == 0) {
                    GlobalVars.getInstance().gamestate = 0;
                    this.lastpos = new Vector2D(this.pos.x, this.pos.y);
                }
            }    
        }
    }

    onClick(x, y) {
        var xtile = Math.floor(x / 32);
        var ytile = Math.floor(y / 32);
        this.targettile = new Vector2D(
            xtile,
            ytile
        );

        var currenttile = new Vector2D(
            Math.floor(this.pos.x / 32),
            Math.floor(this.pos.y / 32)
        );

        var self = this;
        if(currenttile.x != this.targettile.x || currenttile.y != this.targettile.y) {
            this.owner.pathfinder.findPath(currenttile.x, currenttile.y, this.targettile.x, this.targettile.y, function(path) {
                if(path === null) {
                    console.log("PATH NOT FOUND");
                } else {
                    self.path = path.slice(1);
                }
            });
            this.owner.pathfinder.calculate();
        }

    }
};

class Game {
    constructor() {
        this.atlas = new TextureAtlas("atlas/atlas.xml");
        var ctx = document.getElementById("gameCanvas").getContext("2d");
        this.initialized = false;
        this.interpolate = true;
        this.drawgrid = true;
        this.drawstats = true;
        var clone = function(object) { return $.extend(true, {}, object) };
        //console.log(this.atlas.textureMap["Player"]);

        var self = this;
        this.atlas.onsuccesscallback = () => {
            this.tilesize = new Vector2D(
                this.atlas.tilesizex,
                this.atlas.tilesizey,
            );
            this.mapsize = new Vector2D(
                Canvas.getInstance().getWidth() / this.tilesize.x,
                Canvas.getInstance().getHeight() / this.tilesize.y
            );
            self.player = new Player(new Vector2D(32, 32), self.atlas.textureMap["Player"], clone(self));
            self.enemies = new Array(MathHelper.getInstance().generateRandom(1,1));
            for(var i = 0; i < self.enemies.length; i++) {
                self.enemies[i] = new Enemy(
                    new Vector2D(0, 0),
                    self.atlas.textureMap["Enemy" + MathHelper.getInstance().generateRandom(0, 6)],
                    clone(self)
                );
            }
        };

        this.tilemap = [
            [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
            [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
            [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
            [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
            [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
            [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
            [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
            [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
            [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
            [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
            [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
            [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
            [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
            [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
            [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
            [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1]
        ];
        this.pathfinder = new EasyStar.js();
        this.pathfinder.setGrid(this.tilemap);
        this.pathfinder.setAcceptableTiles([0]);
        this.pathfinder.setIterationsPerCalculation(1000);
        this.pathfinder.enableSync();
        this.pathfinder.enableDiagonals();
        this.pathfinder.enableCornerCutting();
    }

    getTimeStamp() {
        return Date.now() - this.start;
    }

    loop() {
        requestAnimationFrame(() => this.loop());
        if(this.atlas.expectedtextures != this.atlas.loadedtextures) return;
        if(this.atlas.textureMap["Player"] == undefined) return;

        var globals = GlobalVars.getInstance();
        if(this.initialized == false) {
            this.initialized = true;
            this.start = Date.now();
        }
        var time = this.getTimeStamp();
        var delta = time - globals.lasttime;
        var targettime = globals.tickinterval * 1000;

        globals.lasttime = time;
        globals.frametime += delta; 
        
        /*
            HACK HACK HACK!
            JavaScript timing is kinda awkward
            The timer starts kind of desynced so if too many ticks have accumulated 
            lets go ahead and ignore them.
        */
        var estimatedticks = Math.ceil(globals.frametime / targettime);
        if(estimatedticks < 10) {
            while(globals.frametime >= targettime) {
                globals.tickcount++;
                globals.frametime -= targettime;
                this.tick(globals.tickinterval);
            }
        } else {
            //Reset our timer
            globals.frametime = 0; 
        }

        globals.framecount++;
        globals.curtime = time;
        globals.interpolation = globals.frametime / targettime;

        var framestart = Date.now();
        this.render();
        var frameend = Date.now();
        globals.framedelay = (frameend - framestart) / 1000;
        //console.log("Delay: " + 1 / globals.framedelay);

    }
    onCanvasClick(event) {
        this.player.onClick(event.offsetX, event.offsetY);
    }
    tick(dt) {
        this.player.tick(dt);
        this.enemies.forEach(function(item, index, array) { item.tick(dt); });
    }

    drawGrid(width, height) {
        var cwidth = Canvas.getInstance().getWidth();
        var cheight = Canvas.getInstance().getHeight();

        for(var row = 1; row < Math.floor(cheight / height); row++) {
            Canvas.getInstance().drawLine(0, row * height, cwidth, row * height, "#fff");
        }
        for(var col = 1; col < Math.floor(cwidth / width); col++) {
            Canvas.getInstance().drawLine(col * height, 0, col * height, cheight, "#fff");
        }
    }
    drawStats() {

    }
    render() {
        var canvas = Canvas.getInstance();
        canvas.clear("#FFF");
        var absx = MathHelper.getInstance().lerp(
            this.player.lastpos.x,
            this.player.pos.x, 
            GlobalVars.getInstance().interpolation
        );
        var absy = MathHelper.getInstance().lerp(
            this.player.lastpos.y,
            this.player.pos.y,
            GlobalVars.getInstance().interpolation
        );
        for(var x = 0; x < this.tilemap.length; x++) {
            for(var y = 0; y < this.tilemap[x].length; y++) {
                canvas.drawTexture(
                    (this.tilemap[x][y] == 0) ? this.atlas.textureMap["Floor"] : this.atlas.textureMap["Collision"],
                    x * 32,
                    y * 32
                )
            }
        }
        canvas.drawTexture(
            this.player.texture,
            (this.interpolate) ? Math.round(this.player.getAbsolutePosition().x) : this.player.pos.x,
            (this.interpolate) ? Math.round(this.player.getAbsolutePosition().y) : this.player.pos.y
        );

        var self = this;
        this.enemies.forEach(function (item, index, array) {
            var enemy = item;
            canvas.drawTexture(
                enemy.texture,
                (self.interpolate) ? Math.round(enemy.getAbsolutePosition().x) : enemy.pos.x,
                (self.interpolate) ? Math.round(enemy.getAbsolutePosition().y) : enemy.pos.y
            );
        });
        
        if(this.drawgrid) {
            this.drawGrid(32, 32);
        }
        if(this.drawstats) {
            this.drawStats();
        }
    }
};