requirejs.config({
    baseUrl: 'assets/js/',
    paths: {
        jquery: 'vendor/jquery-1.11.2.min'
    }
});

require([
    'jquery',
    'constants',
    'util',
    'intersect',
    'Gallery',
    'Point',
    'Camera',
    'Slot',
    'Wall',
    'Painting'
], function($, cst, util, intersect, Gallery, Point, Camera, Slot, Wall, Painting) {

    var canvas = document.getElementById('gallery');
    var ctx = canvas.getContext('2d');

    $('body').css('background', cst.BACKGROUND_COLOR);

    Gallery.mode = Gallery.WALL_MODE;
    Gallery.camera1 = new Camera(new Point(0, 0));
    Gallery.camera2 = new Camera(
        new Point(cst.SCALE * cst.ROOM_WIDTH, cst.SCALE * cst.ROOM_HEIGHT), {
            angleStart: Math.PI,
            direction: -1
        }
    );

    function init() {
        addFrameWalls();
        draw();
    }

    function fillWalls() {
        for (var i=0; i<Gallery.walls.length; i++) {
            var wall = Gallery.walls[i];

            var slots = wall.slots();
            for (var j=0; j<slots.length; j+=2) {
                var location = {
                    slot: slots[j],
                    wall: wall
                };
                addPainting(new Painting(location));
            }
        }
        draw();
    }

    function colorRoom(color) {
        ctx.fillStyle = color
        ctx.fillRect(0, 0, cst.SCALE * cst.ROOM_WIDTH, cst.SCALE * cst.ROOM_HEIGHT);
        ctx.fillStyle = '';
    }

    function drawBackground(color) {
        ctx.fillStyle = color;
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.fillStyle = '';
    }

    function drawDoors() {
        var fillStyle = cst.WALL_COLOR;
        var strokeWidth = 8;

        var doorStart = new Point(cst.SCALE * (cst.ROOM_WIDTH - cst.DOOR_WIDTH), 0);
        var doorEnd = new Point(cst.SCALE * cst.ROOM_WIDTH, 0);
        util.drawLine(doorStart, doorEnd, ctx, fillStyle, strokeWidth);

        var doorStart = new Point(0, cst.SCALE * cst.ROOM_HEIGHT);
        var doorEnd = new Point(cst.SCALE * cst.DOOR_WIDTH, cst.SCALE * cst.ROOM_HEIGHT);
        util.drawLine(doorStart, doorEnd, ctx, fillStyle, strokeWidth);
    }

    function addFrameWalls() {
        var width = cst.ROOM_WIDTH * cst.SCALE;
        var height = cst.ROOM_HEIGHT * cst.SCALE;

        topWall = new Wall(new Point(0, 0), 0, cst.ROOM_WIDTH);
        rightWall = new Wall(new Point(width, 0), Math.PI/2, cst.ROOM_HEIGHT);
        bottomWall = new Wall(new Point(width, height), Math.PI, cst.ROOM_WIDTH);
        leftWall = new Wall(new Point(0, height), 3* Math.PI/2, cst.ROOM_HEIGHT);

        Gallery.walls = Gallery.walls.concat([topWall, rightWall, bottomWall, leftWall]);
    }

    function drawGrid() {
        // Vertical lines
        for (var i=1; i<cst.ROOM_WIDTH; i++) {
            var topPoint = new Point(i * cst.SCALE, 0);
            var bottomPoint = new Point(i * cst.SCALE, cst.ROOM_HEIGHT * cst.SCALE);

            util.drawLine(topPoint, bottomPoint, ctx, '#AAA', 0.5);
        }

        // Horizontal lines
        for (var i=1; i<cst.ROOM_HEIGHT; i++) {
            var leftPoint = new Point(0, i * cst.SCALE);
            var rightPoint = new Point(cst.SCALE * cst.ROOM_WIDTH, i * cst.SCALE);

            util.drawLine(leftPoint, rightPoint, ctx, '#AAA', 0.5);
        }
    }

    function drawWalls() {
        for (var i=0; i<Gallery.walls.length; i++) {
            var wall = Gallery.walls[i];
            var thickness = wall.length > cst.WALL_LENGTH ? 5 : 2;
            util.drawLine(wall.start, wall.end(), ctx, cst.WALL_COLOR, thickness);
        }
    }
    function drawPaintings() {
        for (var i=0; i<Gallery.paintings.length; i++) {
            var painting = Gallery.paintings[i];
            painting.draw(ctx);
        }
    }

    function startWall(mousePos) {
        var wall = new Wall(util.snapToGrid(mousePos));
        Gallery.pendingItem = wall;
    }

    function completeWall(mousePos) {
        var pending = Gallery.pendingItem;
        pending.angle = pending.start.angleBetween(mousePos);
        Gallery.walls.push(pending);
        Gallery.portableWalls.push(pending);
    }

    function drawPendingWall(mousePos) {
        var wallStart = Gallery.pendingItem.start;
        var wallAngle = util.snapToAngle(wallStart.angleBetween(mousePos));
        var wallEnd = wallStart.pointAtAngle(wallAngle, cst.WALL_LENGTH);

        util.drawLine(wallStart, wallEnd, ctx);
    }
    function drawPendingPainting(mousePos) {

        var location = util.snapToWall(mousePos);
        var painting = new Painting(location);
        painting.draw(ctx);
        return painting;
    }
    function addPainting(painting) {
        Gallery.paintings.push(painting);
        updateNumPaintings();
    }

    function drawCursor(point, color) {
        util.drawCircle(ctx, point, cst.CURSOR_SIZE, color);
    }

    function draw(mousePos) {

        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.restore();
        ctx.save();
        drawBackground(cst.BACKGROUND_COLOR);

        ctx.translate(cst.PADDING_LEFT, cst.PADDING_TOP);
        colorRoom(cst.ROOM_COLOR);
        if (Gallery.showGrid) {
            drawGrid();
        }
        if (Gallery.showCamera) {
            Gallery.camera1.drawRange(ctx);
            Gallery.camera2.drawRange(ctx);
        }
        drawWalls();
        drawDoors();
        drawPaintings();

        if (Gallery.showCamera) {
            Gallery.camera1.drawBody(ctx);
            Gallery.camera2.drawBody(ctx);
        }


        if (Gallery.mode == Gallery.WALL_MODE) {
            drawCursor(util.snapToGrid(mousePos));

            if (Gallery.drawing) {
                drawPendingWall(mousePos);
            }
        } else if (Gallery.mode == Gallery.PAINTING_MODE) {
            drawCursor(mousePos);
            drawPendingPainting(mousePos);
        } else if (Gallery.mode == Gallery.ERASE_MODE) {
            drawCursor(util.snapToGrid(mousePos), 'white');
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
        } else if (Gallery.mode == Gallery.ERASE_MODE) {
            deleteItemAtPos(mousePos);
        }
    }

    function deleteItemAtPos(pos) {
        var snappedPos = util.snapToGrid(pos);
        var paintings = Gallery.paintings;
        var walls = Gallery.portableWalls;

        // Try paintings first;
        for (var i=0; i<paintings.length; i++) {
            var painting = paintings[i];

            if (intersect.equalPoints(painting.start(), snappedPos) ||
                intersect.equalPoints(painting.end(), snappedPos)) {

                paintings.splice(paintings.indexOf(painting), 1);
                updateNumPaintings();
                draw();
                return;
            }
        }
        for (var i=0; i<walls.length; i++) {
            var wall = walls[i];

            if (intersect.equalPoints(wall.start, snappedPos) ||
                intersect.equalPoints(wall.end(), snappedPos)) {

                walls.splice(walls.indexOf(wall), 1);
                Gallery.walls.splice(Gallery.walls.indexOf(wall), 1);

                // Delete all child paintings too (reverse order)
                for (var j=paintings.length; j>0; j--) {
                    var painting = paintings[j-1];

                    if (painting.wall == wall) {
                        paintings.splice(paintings.indexOf(painting), 1);
                    }
                }
                updateNumPaintings();
                draw();
                return;
            }
        }
    }

    function updateNumPaintings() {
        $('.num-paintings').text(Gallery.paintings.length);
    }

    function getMousePos(canvas, evt) {
        var rect = canvas.getBoundingClientRect();
        return  new Point(
            evt.clientX - rect.left - cst.PADDING_LEFT,
            evt.clientY - rect.top - cst.PADDING_TOP
        );
    }

    canvas.addEventListener('mousemove', function(evt) {
        draw(getMousePos(canvas, evt));
    }, false);

    canvas.addEventListener("mouseup", function(evt) {
        click(getMousePos(canvas, evt));
    }, false);

    $('.mode').click(function() {
        $('.mode').removeClass('selected');
        $(this).addClass('selected');

        if ($(this).hasClass('paintings')) {
            Gallery.mode = Gallery.PAINTING_MODE;
        } else if ($(this).hasClass('walls')) {
            Gallery.mode = Gallery.WALL_MODE;
        } else if ($(this).hasClass('erase')) {
            Gallery.mode = Gallery.ERASE_MODE;
        }
    });
    $('.reset').click(function() {
        Gallery.walls = [];
        Gallery.portableWalls = [];
        Gallery.paintings = [];
        Gallery.camera1.reset();
        Gallery.camera2.reset();
        init();
    });
    $('.camera').click(function() {
        Gallery.showCamera = !Gallery.showCamera;
        draw();
    });
    $('.grid').click(function() {
        Gallery.showGrid = !Gallery.showGrid;
        draw();
    })
    $('.fill').click(function() {
        fillWalls();
    })

    $('.calculate').click(function() {
        Gallery.camera1.reset();
        Gallery.camera2.reset();
        var score = Gallery.camera1.avePaintingsVisible();
        score += Gallery.camera2.avePaintingsVisible();

        console.log(score);
        $('.score').text(score);
        updateNumPaintings();
    });

    init();

});
