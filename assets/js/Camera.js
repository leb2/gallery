define(['constants', 'Gallery', 'util', 'intersect'],
    function(cst, Gallery, util, intersect) {

    return function(position, options) {
        this.position = position;
        this.angleRange = cst.CAMERA_ANGLE;

        var options = typeof options !== 'undefined' ? options : {};
        this.direction = typeof options.direction !== 'undefined' ? options.direction : 1;
        this.angleStart = typeof options.angleStart !== 'undefined' ? options.angleStart : 0;
        this.angleInitial = this.angleStart;

        this.precision = Math.PI / 30; // 6°
        this.maxAngle = Math.PI / 2;

        this.angleEnd = function() {
            return this.angleStart + this.angleRange;
        }

        this.angleInRange = function(angle) {

            // How to deal with float comparison?
            return angle >= this.angleStart &&
                  (angle < this.angleEnd() || (Math.abs(angle - this.angleEnd()) < 0.0001));
        }

        this.pointInRange = function(point) {

            var angleBetween = this.position.angleBetween(point);
            return this.angleInRange(angleBetween) || this.angleInRange(angleBetween + 2 * Math.PI);
        }

        this.wallIsBlockingPainting = function(wall, painting) {

            var intersectionStart = intersect.segmentIntersection(
                this.position, painting.start(),
                wall.start, wall.end()
            );
            var intersectionEnd = intersect.segmentIntersection(
                this.position, painting.end(),
                wall.start, wall.end()
            );

            if (intersectionEnd || intersectionStart) {

                // Test endpoints of painting
                if (this.canSeePointOverPoint(intersectionStart, painting.start()) &&
                    this.canSeePointOverPoint(intersectionEnd, painting.end())) {

                    return false;
                }

                return true;
            }

            return false; // Wall is not blocking line of sight
        }

        this.canSeePointOverPoint = function(closePoint, farPoint) {
            var totalDistance = this.position.distanceTo(farPoint);
            var toClosePoint = this.position.distanceTo(closePoint);

            return totalDistance / toClosePoint >= cst.PAINTING_TO_CEILING;
        };

        this.numPaintingsAtAngle = function() {
            var count = 0;

            for (var i=0; i<Gallery.paintings.length; i++) {
                var painting = Gallery.paintings[i];

                // Painting is in range
                if (this.pointInRange(painting.start()) ||
                    this.pointInRange(painting.end())) {

                    var paintingVisible = true;
                    for (var j=0; j<Gallery.portableWalls.length; j++) {
                        var wall = Gallery.portableWalls[j];

                        if (wall != painting.wall && this.wallIsBlockingPainting(wall, painting)) {
                            paintingVisible = false;
                        }
                    }
                    count += paintingVisible ? 1 : 0;
                }
            }
            return count;
        }

        this.pan = function() {

            if (Math.abs(this.angleEnd() - this.angleInitial) >= this.maxAngle) {
                return false;
            } else {
                this.angleStart += this.precision;

                return true;
            }
        }

        this.numPaintingsVisible = function() {
            var paintingsVisible = [];
            do {
                paintingsVisible.push(this.numPaintingsAtAngle());

            } while(this.pan())

            return paintingsVisible;
        }

        // Calculates trapezoidal sum
        this.avePaintingsVisible = function() {

            var sum = 0;

            var numPaintings = this.numPaintingsVisible();
            console.log(numPaintings);

            for (var i=0; i<numPaintings.length - 1; i++) {
                sum += (numPaintings[i] + numPaintings[i+1]) / 2;
            }

            if (numPaintings.length == 1) {
                this.reset();
                return numPaintings[0];
            } else {
                console.log("Average Painting: " + (sum / (numPaintings.length - 1)));
                this.reset()
                return sum / (numPaintings.length - 1);
            }
        }

        this.reset = function() {
            this.angleStart = this.angleInitial;
        }

        this.drawRange = function(ctx) {
            var startAnglePoint = this.position.pointAtAngle(this.angleStart, cst.ROOM_WIDTH);
            var endAnglePoint = this.position.pointAtAngle(this.angleEnd(), cst.ROOM_WIDTH / Math.cos(this.angleRange));

            ctx.beginPath();
            ctx.moveTo(this.position.x, this.position.y);
            ctx.lineTo(startAnglePoint.x, startAnglePoint.y);
            ctx.lineTo(endAnglePoint.x, endAnglePoint.y);
            ctx.fillStyle = 'rgba(82, 111, 126, 0.24)';
            ctx.fill();


            // util.drawLine(this.position, startAnglePoint, ctx, "rgba(135, 135, 46, 0.77)");
            // util.drawLine(this.position, endAnglePoint, ctx, "rgba(135, 135, 46, 0.77)");
        }

        this.drawBody = function(ctx) {
            util.drawCircle(ctx, this.position, 8, cst.WALL_COLOR);
        }
    }
});
