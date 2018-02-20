var GameStates = {
    PLAYER_MOVE: 0,
    ENEMY_THINK: 1,
    ENEMY_EXEC: 2,
    PLAYER_ATTACK: 3,
    ENEMY_ATTACK: 4,
};

class _GlobalVars_
{
    constructor()
    {
        this.tickrate = 30;
        this.tickinterval = 1 / this.tickrate;
        this.frametime = 0;
        this.interpolation = 0;
        this.tickcount = 0;
        this.curtime = 0;
        this.framecount = 0;
        this.lasttime = 0;
        this.framedelay = 0;
        this.gamestate = GameStates.PLAYER_MOVE;
        this.nextgamestate = GameStates.PLAYER_MOVE;
        this.timescale = 1.0;
        this.nextturntime = 0.0;
    }

    setTickrate(tickrate) {
        this.tickrate = tickrate;
        this.tickinterval = 1 / tickrate;
    }

    getTickCurtime() {
        return this.tickcount * this.tickinterval;
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