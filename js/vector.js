class Vector2D {
    constructor(x, y) {
        this.x = x;
        this.y = y;
    }

    subtract(other) {
        return new Vector2D(this.x - other.x, this.y - other.y);
    }

    add(other) {
        return new Vector2D(this.x + other.x, this.y - other.y);
    }

    distTo(other) {
        return this.subtract(other).length();
    }
    normalizeInPlace() {
       var thisnorm = this.normalized();
       this.x = thisnorm.x;
       this.y = thisnorm.y;
    }
    normalized() {
        var res = this;
        var l = res.length();
        if(l != 0.0) {
            res.x /= l;
            res.y /= l;
        } else {
            res.x = res.y = 0.0;
        }
        return res;
    }
    length() {
        return Math.sqrt((this.x * this.x) + (this.y * this.y));
    }

    lengthSqr() {
        return (this.x * this.x) + (this.y * this.y); 
    }
};