
class GameObject {
    constructor(pos, texture, owner, id) {
        this.pos = pos;
        this.lastpos = pos;
        this.texture = texture;
        this.owner = owner;
        this.id = id;
        this.health = 100;
        this.defense = MathHelper.getInstance().generateRandom(3, 8);
    }

    damage(damage) {
        this.health = this.health - Math.max(damage - this.defense, 0);
        if(this.health < 0) {
            this.health = 0;
        }
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
    constructor(pos, texture, owner, id) {
        super(pos, texture, owner, id);
        this.prototype = {
            tick: (dt) => this.tick(dt)
        };
        this.texture = texture;
        var spawnx = MathHelper.getInstance().generateRandom(1, this.owner.mapsize.x - 2);
        var spawny = MathHelper.getInstance().generateRandom(1, this.owner.mapsize.y - 2);

        this.pos = new Vector2D(
            spawnx * this.owner.tilesize.x,
            spawny * this.owner.tilesize.y
        );

        this.lastpos = new Vector2D(
            this.pos.x,
            this.pos.y 
        );
        this.attackingtile = new Vector2D(-1, -1);
        this.selectedtile = false;
        this.targettile = new Vector2D(0, 0);
        this.walkspeed = 500;
        this.path = [];
        this.pathcomplete = false;
    }

    tick(dt) {
        var globals = GlobalVars.getInstance();
        if(globals.gamestate == GameStates.PLAYER_MOVE) return;
        this.lastpos = new Vector2D(this.pos.x, this.pos.y);
        if(globals.gamestate == GameStates.ENEMY_THINK) {
            this.targettile = new Vector2D(
                MathHelper.getInstance().generateRandom(1, this.owner.mapsize.x - 2),
                MathHelper.getInstance().generateRandom(1, this.owner.mapsize.y - 2),
            );
            this.currenttile = new Vector2D(
                Math.floor(this.pos.x / 32),
                Math.floor(this.pos.y / 32)
            );
    
            var self = this;
            if(this.currenttile.x != this.targettile.x || this.currenttile.y != this.targettile.y) {
                this.owner.pathfinder.findPath(this.currenttile.x, this.currenttile.y, this.targettile.x, this.targettile.y, function(path) {
                    if(path === null) {
                        console.log("PATH NOT FOUND");
                    } else {
                        self.path = path;
                        for(var i = 0; i < self.path.length; i++) {
                            var translatedPos = new Vector2D(
                                self.path[i].x * 32 + (16),
                                self.path[i].y * 32 + (16)
                            );
                            var colliders =  {
                                x: self.owner.player.pos.x,
                                y: self.owner.player.pos.y,
                                width: 32,
                                height: 32
                            };
                            if(MathHelper.getInstance().boxContains(colliders, translatedPos)) {
                                alert("COLLISION");
                                self.attackingtile = new Vector2D(
                                    self.path[i].x,
                                    self.path[i].y
                                );
                                self.attacking = true;
                                self.path = path.slice(0, i);
                                break;
                            }
                        }
                    }
                });
                this.owner.pathfinder.calculate();
                this.selectedtile = true;
                this.pathcomplete = false;
                globals.nextgamestate = GameStates.ENEMY_EXEC;
            }
        } else if(globals.gamestate == GameStates.ENEMY_EXEC) {
            this.selectedtile = false;
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
                        this.pathcomplete = true;
                        this.lastpos = new Vector2D(this.pos.x, this.pos.y);
                    }
                }    
            }
            if(this.path.length == 0) {
                if(this.attacking) {
                    this.attacking = false;
                    globals.gamestate = GameStates.ENEMY_ATTACK;
                    globals.nextgamestate = GameStates.ENEMY_ATTACK;
                    globals.nextturntime = globals.getTickCurtime() + 0.5;
                } else { 
                    globals.nextgamestate = GameStates.PLAYER_MOVE;
                    globals.nextturntime = globals.getTickCurtime() + 1.1;
                }
            }
        }
    }
}
class Player extends GameObject {
    constructor(pos, texture, owner, id) {
        super(pos, texture, owner, id);
        this.x = 0;
        this.y = 0;
        this.lastx = 0;
        this.lasty = 0;
        this.walkspeed = 350;
        this.targettile = new Vector2D(1, 1);
        this.attackingtile = new Vector2D(-1, -1);
        this.path = [];
    }

    tick(dt) {
        var globals = GlobalVars.getInstance();
        if(globals.gamestate != GameStates.PLAYER_MOVE) return;
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

            var targetpos = new Vector2D(
                this.pos.x + velocity.x * dt,
                this.pos.y + velocity.y * dt
            );
            this.pos = new Vector2D(
                targetpos.x,
                targetpos.y
            );
            if(this.pos.x == (this.path[0].x * 32) && this.pos.y == (this.path[0].y * 32)) {
                this.path = this.path.slice(1);
                if(this.path.length == 0) {
                    if(this.attacking) {
                        this.attacking = false;
                        globals.nextgamestate = GameStates.PLAYER_ATTACK;
                        globals.nextturntime = globals.getTickCurtime() + 0.5;
                    } else { 
                        globals.nextgamestate = GameStates.ENEMY_THINK;
                        globals.nextturntime = globals.getTickCurtime() + 1.1;
                    }
                    this.lastpos = new Vector2D(this.pos.x, this.pos.y);
                }
            }    
        }
    }

    onClick(x, y) {
        if(GlobalVars.getInstance().gamestate != GameStates.PLAYER_MOVE) return;
        var xtile = Math.floor(x / 32);
        var ytile = Math.floor(y / 32);
        this.targettile = new Vector2D(
            xtile,
            ytile
        );

        this.currenttile = new Vector2D(
            Math.floor(this.pos.x / 32),
            Math.floor(this.pos.y / 32)
        );

        var self = this;
        if(this.currenttile.x != this.targettile.x || this.currenttile.y != this.targettile.y) {
            this.owner.pathfinder.findPath(this.currenttile.x, this.currenttile.y, this.targettile.x, this.targettile.y, function(path) {
                if(path === null) {
                    console.log("PATH NOT FOUND");
                } else {
                    self.path = path;
                    for(var i = 0; i < self.path.length; i++) {
                        var translatedPos = new Vector2D(
                            self.path[i].x * 32 + (16),
                            self.path[i].y * 32 + (16)
                        );
                        var colliders =  CollisionTree.getInstance().getPossibleColliders(
                            self.path[i].x * 32,
                            self.path[i].y * 32,
                            32,
                            32
                        );
                        for(var j = 0; j < colliders.length; j++) {
                            if(MathHelper.getInstance().boxContains(colliders[j], translatedPos)) {
                                self.attackingtile = new Vector2D(
                                    self.path[i].x,
                                    self.path[i].y
                                );
                                self.attacking = true;
                                self.path = path.slice(0, i);
                                break;
                            }
                        }
                    }
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
            self.player = new Player(new Vector2D(32, 32), self.atlas.textureMap["Player"], clone(self), 0);
            self.enemies = new Array(MathHelper.getInstance().generateRandom(3,6));
            for(var i = 0; i < self.enemies.length; i++) {
                self.enemies[i] = new Enemy(
                    new Vector2D(0, 0),
                    self.atlas.textureMap["Enemy" + MathHelper.getInstance().generateRandom(0, 6)],
                    clone(self),
                    1 + i
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
        this.pathfinder.setIterationsPerCalculation(5000);
        this.pathfinder.enableSync();
        //this.pathfinder.enableDiagonals();
        //this.pathfinder.enableCornerCutting();
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

        delta *= globals.timescale;

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
        var globals = GlobalVars.getInstance();
        if(globals.nextgamestate != globals.gamestate) {
            if(globals.getTickCurtime() > globals.nextturntime) {
                globals.gamestate = globals.nextgamestate;
            }
        }
        this.player.tick(dt);
        this.enemies.forEach(function(item, index, array) { item.tick(dt); });
        var collision = CollisionTree.getInstance();
        collision.clear();
        var self = this;
        this.enemies.forEach(function(item, index, array){
            collision.addObject(
                item.pos.x,
                item.pos.y,
                self.tilesize.x,
                self.tilesize.y
            );
        });
        if(globals.gamestate == GameStates.PLAYER_ATTACK) {
            for(var i = 0; i < this.enemies.length; i++) {
                var enemy = this.enemies[i];
                var ax = this.player.attackingtile.x;
                var ay = this.player.attackingtile.y;
                var cx = enemy.pos.x / 32;
                var cy = enemy.pos.y / 32;
                if(cx == ax && cy == ay && globals.nextgamestate != GameStates.ENEMY_THINK) {
                    if(enemy.health <= 0) {
                        this.enemies.splice(i, 1);
                    }
                    globals.nextgamestate = GameStates.ENEMY_THINK;
                    globals.nextturntime = globals.getTickCurtime() + 1.1;
                    enemy.damage(10);
                }
            }
        }
        else if (globals.gamestate == GameStates.ENEMY_ATTACK && globals.nextgamestate != GameStates.PLAYER_MOVE) {
            globals.nextgamestate = GameStates.PLAYER_MOVE;
            globals.nextturntime = globals.getTickCurtime() + 1.1;
            alert("test");
            this.player.damage(10);
        }
        else if(globals.gamestate == GameStates.ENEMY_THINK) {
            var finished = true;
            this.enemies.forEach(function(item, index, array){
                if(!item.selectedtile) {
                    finished = false;
                }
            });
            if(finished) {
                globals.gamestate = GameStates.ENEMY_EXEC;
            }
        }
        else if(globals.gamestate == GameStates.ENEMY_EXEC) {
            var finished = true;
            this.enemies.forEach(function(item, index, array){
                if(!item.pathcomplete) {
                    finished = false;
                }
            });
            if(finished) {
                globals.gamestate = GameStates.PLAYER_MOVE;
                globals.nextturntime = globals.getTickCurtime() + 1.1;
            }
        }
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
        if(this.player.health <= 0) {
            canvas.drawText(
                new Vector2D(180, 256),
                "YOU LOSE",
                30,
                "#F00"
            );
            return;
        } else if(this.enemies.length <= 0) {
            canvas.drawText(
                new Vector2D(180, 256),
                "YOU WIN",
                30,
                "#0F0"
            );
            return;
        }
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

        if(this.player.path.length > 0) {
            var scaledPath = MathHelper.getInstance().scalePath(
                this.player.path,
                this.tilesize.x,
                this.tilesize.y
            );
            canvas.drawPath(scaledPath, "#0F0");
        }
        var self = this;
        this.enemies.forEach(function(item, index, array) {
            var scaledPath = MathHelper.getInstance().scalePath(
                item.path,
                self.tilesize.x,
                self.tilesize.y
            );
            canvas.drawPath(scaledPath, "#F00");
        });

        Canvas.getInstance().drawHealthBar(this.player.health, this.player.pos);
        var playerstatus = new Vector2D(
            this.player.pos.x,
            this.player.pos.y + 38
        );
        Canvas.getInstance().drawText(
            playerstatus,
            "Player",
            10,
            "#0F0"
        );
        for(var i = 0; i < this.enemies.length; i++) {
            Canvas.getInstance().drawHealthBar(this.enemies[i].health, this.enemies[i].pos);
            var enemystatus = new Vector2D(
                this.enemies[i].pos.x,
                this.enemies[i].pos.y + 38
            );
            Canvas.getInstance().drawText(
                enemystatus,
                "Enemy",
                10,
                "#F00"
            );
        }
    }
};