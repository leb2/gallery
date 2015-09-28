define([], function() {

    var gallery = function() {
        return {
            ERASE_MODE : "ERASE_MODE",
            WALL_MODE : "WALL_MODE",
            PAINTING_MODE : "PAINTING_MODE",

            drawing: false,
            showGrid: true,
            showCamera: true,
            walls: [],
            portableWalls: [],
            paintings: [], 
            pendingItem: {}
        };
    }

    return gallery();
});
