define(['Point'], function(Point) {
    return function(point, index) {
        this.point = typeof point !== 'undefined' ? point : new Point(0, 0);
        this.index = typeof index !== 'undefined' ? index : 0;
    };
});
