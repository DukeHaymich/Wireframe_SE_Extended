/*** Initiate canvas and drawing area ***/
const canvasPad = document.querySelector(".canvas-container");
const canvas = new fabric.Canvas("canvas", {
    id: -1,
    width: canvasPad.clientWidth,
    height: canvasPad.clientHeight,
    fireRightClick: true,
    fireMiddleClick: true,
    stopContextMenu: true,
    preserveObjectStacking: true,
    selectionFullyContained: true,
});
// const board = new fabric.Rect({
//     id: 1928,
//     width: 1440,
//     height: 900,
//     fill: "white",
//     stroke: "rgba(100, 100, 100, 0.5)",
//     strokeWidth: 1,
//     shadow: new fabric.Shadow({
//         color: "#000000",
//         blur: 15
//     })
// });


/*** Create drawing area/board on canvas ***/
export const initBoard = function(boardId) {
    var board = new fabric.Rect({
        id: boardId,
        width: 1440,
        height: 900,
        fill: "white",
        stroke: "rgba(100, 100, 100, 0.5)",
        strokeWidth: 1,
        shadow: new fabric.Shadow({
            color: "#000000",
            blur: 15
        })
    });
    canvas.add(board);
    canvas.centerObject(board);
    canvas.zoomToPoint({
        x: canvas.width/2,
        y: canvas.height/2
    }, 1*canvas.width/board.width*0.9);
}
initCenteringGuidelines(canvas);
initAligningGuidelines(canvas);
initBoard(1);
export { canvasPad, canvas };



/*** Handle canvas events ***/
/* Zooming at cursor */
canvas.on("mouse:wheel", function(event) {
    var delta = event.e.deltaY;
    var zoom = canvas.getZoom();
    zoom *= 0.999 ** delta;
    if (zoom > 5) zoom = 5;
    if (zoom < 0.1) zoom = 0.1;
    canvas.zoomToPoint({ x: event.e.offsetX, y: event.e.offsetY }, zoom);
    event.e.preventDefault();
    event.e.stopPropagation();
});

/* Panning with middle click */
let mousePressed = false;
canvas.on('mouse:move', function(event) {
    if (mousePressed) {
        const mEvent = event.e;
        canvas.relativePan(new fabric.Point(mEvent.movementX, mEvent.movementY));
        mEvent.preventDefault();
        mEvent.stopPropagation();
    }
});
canvas.on('mouse:down', function(event) {
    if (event.button === 2) {
        mousePressed = true;
        event.e.preventDefault();
        event.e.stopPropagation();
    }
});
canvas.on('mouse:up', function(event) {
    if (event.button === 2) {
        mousePressed = false;
        event.e.preventDefault();
        event.e.stopPropagation();
    }
});

/* Undo-redo */
var state = [JSON.stringify(canvas.toJSON(["id", "parentId", "boardId"]))];
var mods = 0;
export const updateModifications = function() {
    let myjson = JSON.stringify(canvas.toJSON(["id", "parentId", "boardId"]));
    while (mods > 0) {
        mods -= 1;
        state.pop();
    }
    state.push(myjson);
}
canvas.on("object:modified", function() {
    updateModifications();
});
document.addEventListener('keydown', function(event) {
    // Undo
    if (event.ctrlKey && event.key === 'z') {
        if (mods < state.length - 1) {
            mods += 1;
            canvas.loadFromJSON(state[state.length - 1 - mods]);
            canvas.renderAll();
        }
        event.preventDefault();
        event.stopPropagation();
    }
    // Redo
    if (event.ctrlKey && event.key === 'y') {
        if (mods > 0) {
            mods -= 1;
            canvas.loadFromJSON(state[state.length - 1 - mods]);
            canvas.renderAll();
        }
        event.preventDefault();
        event.stopPropagation();
    }
});

/*** Work with canvas ***/
/* Moving drawing board*/
// canvas.on("object:moving", function(event) {
//     let selGroup = new fabric.ActiveSelection(canvas.getActiveObjects(), {
//         canvas: canvas
//     });
//     if (selGroup) {
//         selGroup.forEachObject(function(object) {
//             for (const child of canvas.getObjects()) {
//                 if (child.hasOwnProperty("boardId") && child.parentId === object.id) {
//                     let posX = object.left;
//                     let posY = object.top;
//                     child.left = posX;
//                     child.top = posY;
//                     child.setCoords();
//                 }
//             };
//         });
//     }
// });

/* Removing selected objects */
document.addEventListener('keydown', function(event) {
    if (event.key === "Delete") {
        let selGroup = new fabric.ActiveSelection(canvas.getActiveObjects(), {
            canvas: canvas
        });
        if (selGroup) {
            selGroup.forEachObject(function(object) {
                canvas.remove(object);
            });
        }
        canvas.discardActiveObject().renderAll();
        updateModifications();
        event.preventDefault();
        event.stopPropagation();
    }
});

/* Resolving objects' parent-child hierarchy */
export const objectParser = function() {
    let args = Object.keys(arguments).map((key) => {
        return arguments[key];
    });
    var objectList = [];
    while (args.length !== 0) {
        switch (args[0].type) {
            case "CHECKBOX":
            case "RADIO":
                break;
            default:
                for (var object of args[0].children) {
                    object.data.position.x += args[0].data.position.x;
                    object.data.position.y += args[0].data.position.y;
                    args.push(object);
                }
                delete args[0].children;
                args[0].children = [];
        }
        objectList.push(args[0]);
        args.shift();
    }
    return objectList;
};