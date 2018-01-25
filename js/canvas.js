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

    getWidth() { 
        return this.canvas.width;
    }

    getHeight() { 
        return this.canvas.height;
    }

    drawLine(x0, y0, x1, y1, color) {
        this.ctx.beginPath();
        this.ctx.moveTo(x0, y0);
        this.ctx.lineTo(x1, y1);
        this.ctx.strokeStyle = color;
        this.ctx.stroke();
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