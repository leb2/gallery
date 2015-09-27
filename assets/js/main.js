
requirejs.config({
    baseUrl: 'assets/js/vendor',
    paths: {
        jquery: 'jquery-1.11.2.min'
    }
});

require(['jquery'], function($) {
    var canvas = document.getElementById('gallery');
    var ctx = canvas.getContext('2d');

    var ROOM_WIDTH = 22;
    var ROOM_HEIGHT = 20;
    var SCALE = 20;
    var WALL_LENGTH = 5;
    var PAINTING_LENGTH = 1;

    var CURSOR_SIZE = 5;

    var PADDING_LEFT = 160;
    var PADDING_TOP = 50;

    var CAMERA_ANGLE = Math.PI/6;

    var ANGLE_SNAP = Math.PI/12;

    var PAINTING_COLOR = '#411d3e';


    var Gallery = {
        SELECT_MODE : "Select Mode",
        WALL_MODE : "Wall Mode",
        PAINTING_MODE : "Painting Mode",

        drawing: false,
        walls: [],
        paintings: [],
        pendingItem: {}
    };
    Gallery.mode = Gallery.WALL_MODE;
    Gallery.camera1 = new Camera(new Point(0, 0));
    Gallery.camera2 = new Camera(
        new Point(SCALE * ROOM_WIDTH, SCALE * ROOM_HEIGHT)
    );

    function init() {
        addFrameWalls();
        draw();

    }

    function Camera(position) {
        this.position = position;
        this.angleStart = 0;
        this.angleEnd = this.angleStart + CAMERA_ANGLE;

        this.angleInRange = function(angle) {
            return angle >= this.angleStart && angle <= this.angleEnd;
        }

        this.pointInRange = function(point) {
            return (this.angleInRange(this.position.angleBetween(point)))
        }

        this.paintingsVisible = function() {
            var count = 0;

            for (var i=0; i<Gallery.paintings.length; i++) {
                var painting = Gallery.paintings[i];
                if (this.pointInRange(painting.start()) ||
                    this.pointInRange(painting.end())) {
                        count += 1;
                }
            }

            return count;
        }

        this.drawRange = function() {
            var startAnglePoint = this.position.pointAtAngle(this.angleStart, 24);
            var endAnglePoint = this.position.pointAtAngle(this.angleEnd, 24);
            drawLine(this.position, startAnglePoint, "orange");
            drawLine(this.position, endAnglePoint, "orange");
        }
    }

    function Slot(point, index) {
        this.point = typeof point !== 'undefined' ? point : new Point(0, 0);
        this.index = typeof index !== 'undefined' ? index : 0;
    }

    function Point(x, y) {
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
            var x = SCALE * length * Math.cos(angle);
            var y = SCALE * length * Math.sin(angle);

            return new Point(this.x + x, this.y + y);
        }
    }

    function Wall(start, angle, length) {
        this.start = start;
        this.angle = typeof angle !== 'undefined' ? angle : 0;
        this.length = typeof length !== 'undefined' ? length: WALL_LENGTH;

        console.log("AT THE SETTING");
        console.log(this.length);

        this.end = function() {
            var angle = snapToAngle(this.angle); // Safety
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
            var angle = snapToAngle(this.angle);
            var slotY = this.start.y + index * SCALE * Math.sin(angle);
            var slotX = this.start.x + index * SCALE * Math.cos(angle);
            return new Point(slotX, slotY);
        }
    }
    function Painting(location) {
        this.wall = location.wall;
        this.slot = location.slot;

        this.start = function() {
            return this.wall.slotByIndex(this.slot.index);
        }
        this.end = function() {
            return this.wall.slotByIndex(this.slot.index + 1);
        }

        this.draw = function() {
            start = this.start();
            end = this.end();

            drawLine(start, end, PAINTING_COLOR, 4);
        };
    }

    function roundToNearest(number, toNearest) {
        return Math.round(number / toNearest) * toNearest;
    }
    function snapToWall(point) {
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
    }

    function snapToGrid(point) {
        for (var i=0; i<Gallery.walls.length; i++) {
            var wall = Gallery.walls[i]
            if (point.distanceTo(wall.start) <= SCALE) {
                return wall.start;
            } else if (point.distanceTo(wall.end()) <= SCALE) {
                return wall.end();
            }
        }
        return new Point(
            roundToNearest(point.x, SCALE),
            roundToNearest(point.y, SCALE)
        );
    }
    function snapToAngle(angle) {
        return roundToNearest(angle, ANGLE_SNAP);
    }

    function drawBackground() {
        ctx.fillStyle = 'rgb(44, 90, 120)';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.fillStyle = '';
    }

    function drawLine(start, end, color, lineWidth) {
        color = typeof color !== 'undefined' ? color : "#111";
        lineWidth = typeof lineWidth !== 'undefined' ? lineWidth : 1;

        ctx.lineWidth = lineWidth;
        ctx.strokeStyle = color;
        path = new Path2D();
        path.moveTo(start.x, start.y);
        path.lineTo(end.x, end.y);
        ctx.stroke(path);
        ctx.lineWidth = 1;
    }

    function addFrameWalls() {
        console.log("Adding frame Walls");

        var width = ROOM_WIDTH * SCALE;
        var height = ROOM_HEIGHT * SCALE;

        topWall = new Wall(new Point(0, 0), 0, ROOM_WIDTH);
        rightWall = new Wall(new Point(width, 0), Math.PI/2, ROOM_HEIGHT);
        bottomWall = new Wall(new Point(width, height), Math.PI, ROOM_WIDTH);
        leftWall = new Wall(new Point(0, height), 3* Math.PI/2, ROOM_HEIGHT);

        Gallery.walls = Gallery.walls.concat([topWall, rightWall, bottomWall, leftWall]);
        console.log(Gallery.walls);
    }

    function drawWalls() {
        for (var i=0; i<Gallery.walls.length; i++) {
            var wall = Gallery.walls[i];
            console.log("logging the end:");
            console.log(wall);
            drawLine(wall.start, wall.end());
        }
    }
    function drawPaintings() {
        for (var i=0; i<Gallery.paintings.length; i++) {
            var painting = Gallery.paintings[i];
            painting.draw();
        }
    }

    function startWall(mousePos) {
        var wall = new Wall(snapToGrid(mousePos));
        Gallery.pendingItem = wall;
    }

    function completeWall(mousePos) {
        var pending = Gallery.pendingItem;
        pending.angle = pending.start.angleBetween(mousePos);
        Gallery.walls.push(pending);
        console.log(Gallery.walls);
    }

    function drawPendingWall(mousePos) {
        var wallStart = Gallery.pendingItem.start;
        var wallAngle = snapToAngle(wallStart.angleBetween(mousePos));
        var wallEnd = wallStart.pointAtAngle(wallAngle, WALL_LENGTH);

        drawLine(wallStart, wallEnd);
    }
    function drawPendingPainting(mousePos) {

        var location = snapToWall(mousePos);
        var painting = new Painting(location);
        painting.draw();
        return painting;
    }
    function addPainting(painting) {
        Gallery.paintings.push(painting);
        console.log(Gallery.paintings);
    }

    function drawCursor(point, color) {

        if (color == undefined) {
            color = '#333'
        }

        ctx.fillStyle = color;
        ctx.beginPath();
        ctx.arc(point.x, point.y, CURSOR_SIZE, 0, 2 * Math.PI, false);

        ctx.fill();
        ctx.fillStyle = '';
    }

    function draw(mousePos) {

        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.restore();
        ctx.save();
        drawBackground();

        ctx.translate(PADDING_LEFT, PADDING_TOP);
        drawBackground();
        drawWalls();
        drawPaintings();

        console.log(mousePos);
        console.log(Gallery);
        console.log("\n\n\n");

        Gallery.camera1.drawRange();

        if (Gallery.mode == Gallery.WALL_MODE) {
            drawCursor(snapToGrid(mousePos));

            if (Gallery.drawing) {
                drawPendingWall(mousePos);
            }
        } else if (Gallery.mode == Gallery.PAINTING_MODE) {
            drawCursor(mousePos);
            // drawCursor(snapToWall(mousePos).slot.point, PAINTING_COLOR);

            drawPendingPainting(mousePos);
        }
    }

    function click(mousePos) {

        if (Gallery.mode == Gallery.WALL_MODE) {
            if (!Gallery.drawing) {
                startWall(mousePos);
            } else {
                completeWall(mousePos);
            }
            Gallery.drawing = !Gallery.drawing;

        } else if (Gallery.mode == Gallery.PAINTING_MODE) {
            addPainting(drawPendingPainting(mousePos));
        }
    }

    function getMousePos(canvas, evt) {
        var rect = canvas.getBoundingClientRect();
        return  new Point(
            evt.clientX - rect.left - PADDING_LEFT,
            evt.clientY - rect.top - PADDING_TOP
        );
    }

    canvas.addEventListener('mousemove', function(evt) {
        draw(getMousePos(canvas, evt));
    }, false);

    canvas.addEventListener("mousedown", function(evt) {
        click(getMousePos(canvas, evt));
    }, false);

    $('.mode').click(function() {
        $('.mode').removeClass('selected');
        $(this).addClass('selected');

        if ($(this).hasClass('paintings')) {
            Gallery.mode = Gallery.PAINTING_MODE;
        } else if ($(this).hasClass('walls')) {
            Gallery.mode = Gallery.WALL_MODE;
        } else if ($(this).hasClass('select')) {
            Gallery.mode = Gallery.SELECT_MODE;
        }
    });
    $('.reset').click(function() {
        Gallery.walls = [];
        Gallery.paintings = [];
        init();
    });

    $('.calculate').click(function() {
        var score = Gallery.camera1.paintingsVisible();
        console.log(score);
        $('.score').text(score);
    });

    init();

});
