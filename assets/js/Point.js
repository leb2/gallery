define(['constants'], function(cst) {

    var Point = function(x, y) {
        this.x = x;
        this.y = y;

        this.angleBetween = function(point) {
            return Math.atan2(point.y - this.y, point.x - this.x);
        }
        this.distanceTo = function(point) {
            var x = this.x - point.x;
            var y = this.y - point.y;
            return Math.sqrt(x * x + y * y);
        }
        this.pointAtAngle = function(angle, length) {
            var x = cst.SCALE * length * Math.cos(angle);
            var y = cst.SCALE * length * Math.sin(angle);

            return new Point(this.x + x, this.y + y);
        }
    }

    return Point;
});
