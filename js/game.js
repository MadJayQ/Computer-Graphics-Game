class GameObject {
    constructor(pos, texture) {
        this.pos = pos;
        this.lastpos = pos;
        this.texture = texture;
    }

    tick(dt) {

    }
};
class Player extends GameObject {
    constructor(pos, texture) {
        super(pos, texture);
        this.prototype = {
            tick: (dt) => this.tick(dt)
        };

        this.x = 0;
        this.y = 0;
        this.lastx = 0;
        this.lasty = 0;
        this.walkspeed = 300;
    }

    tick(dt) {
        this.lastx = this.x;
        this.lasty = this.y;
        this.x += this.walkspeed * dt;
        this.y += this.walkspeed * dt;
    }
};
class Texture {
    constructor(row, col, sizex, sizey) {
        this.row = row;
        this.col = col;
        this.sizex = sizex;
        this.sizey = sizey;
        this.texture = new ImageData(60, 60);
    }
    setTexture(texture) {
        this.texture = texture;
    }
};
class TextureAtlas
{
    constructor(src) 
    {
        var self = this;
        console.log("Requesting: " + src);
        this.source = new Image();
        this.textureMap = {};
        this.paddingx = 0;
        this.paddingy = 0;
        this.loadedtextures = 0;
        this.expectedtextures = 0;
        $.ajax({
            url: src,
            success: function (data){
                self.paddingx = ($($(data).find("header")).find("padding-x").text());
                self.paddingy = $($(data).find("header")).find("padding-y").text();
                var src = $($(data).find("header")).find("source").text();
                var textureMap = {};
                $(data).find("sprite").each(function(){
                    var name = $(this).find("name").text();
                    var row = $(this).find("row").text();
                    var col = $(this).find("col").text();
                    var sizex = $(this).find("sizex").text();
                    var sizey = $(this).find("sizey").text();   
                    var texture = new Texture(row, col, sizex, sizey);
                    self.expectedtextures++;
                    self.textureMap[name] = texture;
                });
                /*
                    Okay so this is really hacky, but whatever 
                    I'm going to create a canvas element in memory
                    Load my atlas into the memory through the canvas context
                    Then grab subimages of my sprites...what???
                */
                var canvas = document.createElement("canvas");
                var ctx = canvas.getContext("2d");
                self.source.src = src;
                self.source.onload = function() {
                    ctx.drawImage(self.source, 0, 0);
                    for(var key in self.textureMap) {
                        var texture = self.textureMap[key];
                        var srcx = texture.col;
                        var srcy = texture.row;
                        texture.texture = ctx.getImageData(0,0, 60, 60);
                        self.loadedtextures++;
                    }
                };
            },
            error: function(msg) {
                console.error(src + " not found");
            }
        });
    }
};
class Game {
    constructor() {
        this.atlas = new TextureAtlas("atlas/atlas.xml");
        var ctx = document.getElementById("gameCanvas").getContext("2d");
        this.initialized = false;
        this.interpolate = true;

        this.player = new Player(new Vector2D(0, 0), this.atlas.textureMap["Player"]);
    }

    getTimeStamp() {
        return Date.now() - this.start;
    }

    loop() {
        requestAnimationFrame(() => this.loop());

        if(this.atlas.expectedtextures != this.atlas.loadedtextures) return;
        if(this.atlas.textureMap["Player"] == undefined) return;

        var globals = GlobalVars.getInstance();
        globals.setTickrate(16);
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
            The timer starts kind of desynched so if too many ticks have accumulated 
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
        this.render();

    }

    tick(dt) {
        this.player.tick(dt);
    }

    render() {
        var canvas = Canvas.getInstance();
        canvas.clear("#FFF");
        var absx = MathHelper.getInstance().lerp(
            this.player.lastx,
            this.player.x, 
            GlobalVars.getInstance().interpolation
        );
        var absy = MathHelper.getInstance().lerp(
            this.player.lasty,
            this.player.y,
            GlobalVars.getInstance().interpolation
        );
        canvas.drawTexture(
            this.atlas.textureMap["Player"],
            (this.interpolate) ? absx : this.player.x,
            (this.interpolate) ? absy : this.player.y
        );
    }
};