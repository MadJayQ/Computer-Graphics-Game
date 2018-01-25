class _Profiler_ {
    constructor() {
        this.frames = new Array();
        this.avg = 0;
        this.min = 0;
        this.max = 0;
        this.idx = 0;
        var self = this;
        this.prototype = {
            update: function(dt) {
                if(self.frames.length < 100) {
                    self.frames.push(t);
                } else {
                    self.frames[self.idx] = dt;
                    self.idx = (self.idx + 1 % 100);
                }
                var min = self.frames[0];
                var max = self.frames[0];
                var avg = 0;
                self.frames.forEach(function(o, i, a) {
                    if(min > o) min = o;
                    if(max < o) max = o;
                    avg += o;
                });
                avg /= self.frames.length;
                self.min = min;
                self.max = max;
                self.avg = avg;
            }
        };
    }
};

var Profiler = (function(){
    var instance;
    return {
        getInstance: function(){
            if (null == instance) {
                instance = new _Profiler_();            
                //instance.constructor = null; 
            }
            return instance; 
        }
   };
})();