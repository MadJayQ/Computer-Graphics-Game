/*
    Javascript Singleton Pattern
    Math Helper
*/

class _MathHelper_
{
    generateRandom(min, max) {
        return Math.floor(Math.random() * (max - min + 1)) + min;
    }
    scalePath(path, scalarx, scalary) {
        var arr = path;
        var ret = new Array(path.length);
        arr.forEach(function(item, index, array) {
            ret[index] = new Vector2D(
                (item.x * scalarx) + (scalarx / 2),
                (item.y * scalary) + (scalary / 2)
            );
        });
        return ret;
    }
    boxContains(box, pos) {
        var p = pos;
        var valx = box.x <= pos.x && pos.x <= box.x + parseInt(box.width);
        var valy = box.y <= pos.y && pos.y <= box.y + parseInt(box.height);
        
        return valx && valy;
    }
    lerp(v0, v1, dt) {
        return v0 + dt * (v1 - v0);
    }
};
var MathHelper = (function(){
    function MathHelper() {

    }
    var instance;
    return {
        getInstance: function(){
            if (null == instance) {
                instance = new _MathHelper_();             
                instance.constructor = null;
            }
            return instance; 
        }
   };
})();