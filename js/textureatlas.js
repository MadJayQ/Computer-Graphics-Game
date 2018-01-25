class Texture {
    constructor(row, col, sizex, sizey) {
        this.row = row;
        this.col = col;
        this.sizex = sizex;
        this.sizey = sizey;
        this.texture = new ImageData(sizex, sizey);
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
        this.tilesizex = 0;
        this.tilesizey = 0;
        this.loadedtextures = 0;
        this.expectedtextures = 0;
        $.ajax({
            url: src,
            success: function (data){
                self.paddingx = ($($(data).find("header")).find("padding-x").text());
                self.paddingy = $($(data).find("header")).find("padding-y").text();
                self.tilesizex = $($(data).find("header")).find("tilewidth").text();
                self.tilesizey = $($(data).find("header")).find("tileheight").text();
                var src = $($(data).find("header")).find("source").text();
                var textureMap = {};
                $(data).find("sprite").each(function(){
                    var name = $(this).find("name").text();
                    var row = $(this).find("row").text();
                    var col = $(this).find("col").text();
                    var sizex = $(this).find("sizex").text();
                    var sizey = $(this).find("sizey").text();   
                    var texture = new Texture(row, col, sizex * self.tilesizex, sizey * self.tilesizey);
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
                        var srcx = (texture.col * self.paddingx) + (texture.col * self.tilesizex);
                        var srcy = (texture.row * self.paddingy) + (texture.row * self.tilesizey);
                        texture.texture = ctx.getImageData(srcx,srcy, self.tilesizex, self.tilesizey);
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