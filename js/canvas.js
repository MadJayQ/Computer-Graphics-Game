class _Canvas_
{
    constructor()
    {
        this.canvas = $("canvas").get(0);
        this.ctx = this.canvas.getContext("2d");
    }

    getCenter() {
        return [this.canvas.width / 2, this.canvas.height / 2];
    }

    setSize(width, height) {
        this.canvas.width = width;
        this.canvas.height = height;
    }

    drawTexture(tex, x, y) {
        this.ctx.putImageData(tex.texture, x, y);
    }

    clear(color) {
        this.ctx.fillStyle = color;
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
    }
};

var Canvas = (function(){
    var instance;
    return {
        getInstance: function(){
            if (null == instance) {
                instance = new _Canvas_();            
                instance.constructor = null; 
            }
            return instance; 
        }
   };
})();