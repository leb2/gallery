/**
* @author Peter Kelley
* @author pgkelley4@gmail.com
*/

define(['Point'], function(Point) {

    function Intersect() {
        /**
        * Subtract the second point from the first.
        *
        * @param {Object} point1 point object with x and y coordinates
        * @param {Object} point2 point object with x and y coordinates
        *
        * @return the subtraction result as a point object
        */
        this.subtractPoints = function(point1, point2) {
            var result = {};
            result.x = point1.x - point2.x;
            result.y = point1.y - point2.y;

            return result;
        }


        /**
        * Calculate the cross product of the two points.
        *
        * @param {Object} point1 point object with x and y coordinates
        * @param {Object} point2 point object with x and y coordinates
        *
        * @return the cross product result as a float
        */
        this.crossProduct = function(point1, point2) {
            return point1.x * point2.y - point1.y * point2.x;
        }


        /**
        * See if the points are equal.
        *
        * @param {Object} point1 point object with x and y coordinates
        * @param {Object} point2 point object with x and y coordinates
        *
        * @return if the points are equal
        */
        this.equalPoints = function(point1, point2) {
            return (point1.x == point2.x) && (point1.y == point2.y)
        }


        /**
        * See if two line segments intersect. This uses the
        * vector cross product approach described below:
        * http://stackoverflow.com/a/565282/786339
        *
        * @param {Object} p point object with x and y coordinates
        *  representing the start of the 1st line.
        * @param {Object} p2 point object with x and y coordinates
        *  representing the end of the 1st line.
        * @param {Object} q point object with x and y coordinates
        *  representing the start of the 2nd line.
        * @param {Object} q2 point object with x and y coordinates
        *  representing the end of the 2nd line.
        */
        this.segmentIntersection = function(p, p2, q, q2) {
            var r = this.subtractPoints(p2, p);
            var s = this.subtractPoints(q2, q);

            var uNumerator = this.crossProduct(this.subtractPoints(q, p), r);
            var denominator = this.crossProduct(r, s);

            if (uNumerator == 0 && denominator == 0) {
                // They are coLlinear

                // Do they touch? (Are any of the points equal?)
                if (this.equalPoints(p, q) || this.equalPoints(p, q2) || this.equalPoints(p2, q) || this.equalPoints(p2, q2)) {
                    return true
                }
                // Do they overlap? (Are all the point differences in either direction the same sign)
                // Using != as exclusive or
                return ((q.x - p.x < 0) != (q.x - p2.x < 0) != (q2.x - p.x < 0) != (q2.x - p2.x < 0)) ||
                ((q.y - p.y < 0) != (q.y - p2.y < 0) != (q2.y - p.y < 0) != (q2.y - p2.y < 0));
            }

            if (denominator == 0) {
                // lines are paralell
                return false;
            }

            var u = uNumerator / denominator;
            var t = this.crossProduct(this.subtractPoints(q, p), s) / denominator;

            if ((t >= 0) && (t <= 1) && (u >= 0) && (u <= 1)) {
                // Intersection point = p + tr
                var x = p.x + t * r.x;
                var y = p.y + t * r.y;
                return new Point(x, y);
            } else {
                return false;
            }


        }
    }

    return new Intersect();
})
