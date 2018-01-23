/*
    Javascript Singleton Pattern
    Math Helper
*/

class _MathHelper_
{
    generateRandom(min, max) {
        return Math.floor(Math.random() * (max - min + 1)) + min;
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