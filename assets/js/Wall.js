define(['constants', 'util', 'Slot', 'Point'],
function(cst, util, Slot, Point) {

    return function(start, angle, length) {
        this.start = start;
        this.angle = typeof angle !== 'undefined' ? angle : 0;
        this.length = typeof length !== 'undefined' ? length: cst.WALL_LENGTH;

        this.end = function() {
            var angle = util.snapToAngle(this.angle); // Safety
            return this.start.pointAtAngle(angle, this.length);
        }

        this.slots = function() {
            var slots = [];

            for (var i=0; i<this.length; i++) {
                slots.push(new Slot(this.slotByIndex(i), i));
            }
            return slots;
        }

        this.slotByIndex = function(index) {
            var angle = util.snapToAngle(this.angle);
            var slotY = this.start.y + index * cst.SCALE * Math.sin(angle);
            var slotX = this.start.x + index * cst.SCALE * Math.cos(angle);
            return new Point(slotX, slotY);
        }
    }
})
