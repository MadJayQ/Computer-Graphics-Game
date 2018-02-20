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

    drawBox(x0, y0, width, height, color) {
        this.ctx.strokeStyle = "#FF0000";
        this.ctx.rect(20,20,150,100);
        this.ctx.stroke();
    }
    drawLine(x0, y0, x1, y1, color) {
        this.ctx.beginPath();
        this.ctx.moveTo(x0, y0);
        this.ctx.lineTo(x1, y1);
        this.ctx.strokeStyle = color;
        this.ctx.stroke();
    }

    drawPath(path, color) {
        this.ctx.strokeStyle = color;
        this.ctx.beginPath();
        if(path.length > 0) {
            this.ctx.moveTo(path[0].x, path[0].y);
            for(var i = 0; i < path.length; i++) {
                this.ctx.lineTo(path[i].x, path[i].y);
            }
        }
        this.ctx.stroke();
    }

    drawText(pos, text, size, color) {
        this.ctx.font = size + "px Arial";
        this.ctx.fillStyle = color;
        this.ctx.fillText(text, pos.x, pos.y);
    }

    drawHealthBar(health, pos) {
        this.ctx.font = "10px Arial";
        var color = (health > 50) ? "#0F0" : "#F00"; 
        this.ctx.fillStyle = "#0F0";
        this.ctx.fillText("HP: " + health,pos.x,pos.y);
        
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