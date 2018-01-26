class _GlobalVars_
{
    constructor()
    {
        this.tickrate = 64;
        this.tickinterval = 1 / this.tickrate;
        this.frametime = 0;
        this.interpolation = 0;
        this.tickcount = 0;
        this.curtime = 0;
        this.framecount = 0;
        this.lasttime = 0;
        this.framedelay = 0;
    }

    setTickrate(tickrate) {
        this.tickrate = tickrate;
        this.tickinterval = 1 / tickrate;
    }
};

var GlobalVars = (function(){
    var instance;
    return {
        getInstance: function(){
            if (null == instance) {
                instance = new _GlobalVars_();            
                instance.constructor = null; 
            }
            return instance; 
        }
   };
})();