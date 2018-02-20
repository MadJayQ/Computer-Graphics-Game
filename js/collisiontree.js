class _CollisionTree_ {
    constructor() {
        this.tree = new Quadtree({
            x: 0, 
            y: 0, 
            width: Canvas.getInstance().getWidth(), 
            height: Canvas.getInstance().getHeight()
        });        
    }
    clear() { 
        this.tree.clear();
    }
    addObject(x, y, w, h) {
        this.tree.insert({
            x: x,
            y: y,
            width: w,
            height: h,
        });
    }
    getPossibleColliders(x, y, w, h) {
        return this.tree.retrieve({
            x: x,
            y: y,
            width: w,
            height: h
        });
    }
};
var CollisionTree = (function(){
    function MathHelper() {

    }
    var instance;
    return {
        getInstance: function(){
            if (null == instance) {
                instance = new _CollisionTree_();             
                instance.constructor = null;
            }
            return instance; 
        }
   };
})();