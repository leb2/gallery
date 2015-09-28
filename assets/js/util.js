define(['Gallery', 'Point', 'Slot', 'constants'],
    function(Gallery, Point, Slot, cst) {

    function Util() {
        this.roundToNearest = function(number, toNearest) {
            return Math.round(number / toNearest) * toNearest;
        };
        this.snapToWall = function(point) {
            var closestSlot = new Slot();
            var closestWall = {};

            // Loop through all slots in all walls
            for (var i=0; i<Gallery.walls.length; i++) {
                wall = Gallery.walls[i];
                var slots = wall.slots();

                for (var j=0; j<slots.length; j++) {
                    var slot = slots[j];

                    if (point.distanceTo(slot.point) < point.distanceTo(closestSlot.point)) {
                        closestSlot = slot;
                        closestWall = wall;
                    }
                }
            }

            return {
                wall: closestWall,
                slot: closestSlot
            };
        };

        this.snapToGrid = function(point) {
            for (var i=0; i<Gallery.walls.length; i++) {
                var wall = Gallery.walls[i]

                // Also snaps to wall endpoints
                if (point.distanceTo(wall.start) <= cst.SCALE) {
                    return wall.start;
                } else if (point.distanceTo(wall.end()) <= cst.SCALE) {
                    return wall.end();
                }
            }
            return new Point(
                this.roundToNearest(point.x, cst.SCALE),
                this.roundToNearest(point.y, cst.SCALE)
            );
        };

        this.snapToAngle = function(angle) {
            return this.roundToNearest(angle, cst.ANGLE_SNAP);
        };

        this.drawLine = function(start, end, ctx, color, lineWidth) {
            color = typeof color !== 'undefined' ? color : "#111";
            lineWidth = typeof lineWidth !== 'undefined' ? lineWidth : 2;

            ctx.lineWidth = lineWidth;
            ctx.strokeStyle = color;
            path = new Path2D();
            path.moveTo(start.x, start.y);
            path.lineTo(end.x, end.y);
            ctx.stroke(path);
            ctx.lineWidth = 1;
        }

        this.drawCircle = function(ctx, center, radius, color) {
            color = typeof color !== "undefined" ? color : '#333';

            ctx.fillStyle = color;
            ctx.beginPath();
            ctx.arc(center.x, center.y, radius, 0, 2 * Math.PI, false);

            ctx.fill();
            ctx.fillStyle = '';
        }
    }

    return new Util();
});
