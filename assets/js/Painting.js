
define(['constants', 'util'], function(cst, util) {

    return function(location) {
        this.wall = location.wall;
        this.slot = location.slot;

        this.start = function() {
            return this.wall.slotByIndex(this.slot.index);
        }
        this.end = function() {
            return this.wall.slotByIndex(this.slot.index + 1);
        }

        this.draw = function(ctx) {
            start = this.start();
            end = this.end();

            util.drawLine(start, end, ctx, cst.WALL_COLOR, 6);
            util.drawLine(start, end, ctx, cst.PAINTING_COLOR, 4);
        };
    };
})
