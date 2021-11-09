import * as UTIL from './lib/utility.js';


/*** Initiate canvas and drawing area ***/
const canvasPad = document.querySelector(".canvas-container");
const canvas = new fabric.Canvas("canvas", {
    id: -1,
    width: canvasPad.clientWidth,
    height: canvasPad.clientHeight,
    fireRightClick: true,
    fireMiddleClick: true,
    stopContextMenu: true
});
const board = new fabric.Rect({
    id: 1928,
    width: canvas.width * 0.9,
    height: canvas.height * 0.8,
    fill: "white",
    shadow: new fabric.Shadow({
        color: "rgb(100, 100, 100)",
        blur: 5
    }),
    children: []
});
canvas.add(board);
canvas.centerObject(board);
canvas.preserveObjectStacking = true;



/*** Handle canvas events ***/
/* Zooming at cursor */
canvas.on("mouse:wheel", function(event) {
    var delta = event.e.deltaY;
    var zoom = canvas.getZoom();
    zoom *= 0.999 ** delta;
    if (zoom > 10) zoom = 10;
    if (zoom < 0.25) zoom = 0.25;
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
var state = [JSON.stringify(canvas)];
var mods = 0;
const updateModifications = function() {
    let myjson = JSON.stringify(canvas);
    while (mods > 0) {
        mods -= 1;
        state.pop();
    }
    state.push(myjson);
}
canvas.on("object:modified", function() {
    updateModifications();
}, "object:added", function() {
    updateModifications();
}, "object:removed", function() {
    updateModifications();
});
document.addEventListener('keydown', function(event) {
    // Undo
    if (event.ctrlKey && event.key === 'z') {
        if (mods < state.length - 1) {
            canvas.clear().renderAll();
            canvas.loadFromJSON(state[state.length - 1 - mods - 1]);
            canvas.renderAll();
            mods += 1;
        }
        event.preventDefault();
        event.stopPropagation();
    }
    // Redo
    if (event.ctrlKey && event.key === 'y') {
        if (mods > 0) {
            canvas.clear().renderAll();
            canvas.loadFromJSON(state[state.length - 1 - mods + 1]);
            canvas.renderAll();
            mods -= 1;
        }
        event.preventDefault();
        event.stopPropagation();
    }
});



/*** Work with JSON ***/
const JSONtextarea = document.getElementById("json");
const notiDiv = document.querySelector(".notification");
var objectList;
var timerID;
const notify = function(content, type, milisec) {
    if (notiDiv.firstChild !== null) {
        notiDiv.removeChild(notiDiv.firstChild);
    }
    clearTimeout(timerID);
    notiDiv.classList.remove(...notiDiv.classList);
    notiDiv.appendChild(content);
    notiDiv.classList.add("notification", "active", type);
    timerID = setTimeout(() => {
        notiDiv.classList.remove("active");
        setTimeout(() => {
            notiDiv.classList.remove(type);
            notiDiv.removeChild(notiDiv.firstChild);
        }, 250);
    }, milisec);
}

/* Import into canvas */
const importButton = document.getElementById("importBtn");
const importFail = UTIL.NotifyText(
   "Error:",
   "The text you entered is not JSON type!"
);
const importSuccess = UTIL.NotifyText(
    "Success!",
    "The canvas is now displaying imported content."
);
const unsupported = UTIL.NotifyText(
    "Warning:",
    "Some of components imported are unsupported!"
);
importButton.addEventListener("click", () => {
    objectList = UTIL.JSONParser(JSONtextarea.value);
    if (objectList === null) {
        notify(importFail, "fail", 5000);
    } else {
        if (renderCanvas(objectList) === 0) {
            notify(importSuccess, "success", 5000);
        } else {
            notify(unsupported, "fail", 5000);
        }
    }
});

/* Export from canvas */
//TODO

/* Copy to clipboard */
const copyBtn = document.getElementById("copyBtn");
const copySuccess = UTIL.NotifyText(
    "Success!",
    "The JSON is copied to your clipboard!"
);
copyBtn.addEventListener("click", function() {
    navigator.clipboard.writeText(JSONtextarea.value);
    notify(copySuccess, "success", 5000);
});



/*** Work with canvas and components***/
/* Moving drawing board*/
board.on("moving", function(event) {
    for (const object of canvas.getObjects()) {
        if (object.hasOwnProperty("parentId") && object.parentId === board.id) {
            var pointer = canvas.getPointer(event.e);
            var posX = pointer.x;
            var posY = pointer.y;
            object.left = board.left + object.left;
            object.top = board.top + object.top;
            object.setCoords();
        }
    };
});

/* Removing selected objects */
document.addEventListener('keydown', function(event) {
    if (event.key === "Delete") {
        var selGroup = new fabric.ActiveSelection(canvas.getActiveObjects(), {
            canvas: canvas
        });
        if (selGroup) {
            selGroup.forEachObject(function(object) {
                // for (const board of canvas.getObjects()) {
                    // if (board.id === object.parentId) {
                        board.children.splice(board.children.indexOf(object), 1);
                        // break;
                    // }
                // }
                canvas.remove(object);
            });
        }
        canvas.discardActiveObject().renderAll();
        event.preventDefault();
        event.stopPropagation();
    }
});

/* Rendering canvas */
const renderCanvas = function(objectList) {
    var errCode = 0;
    // console.log(objectList);
    for (const object of canvas.getObjects()) {
        if (object !== board) {
            canvas.remove(object);
        }
    }
    for (const object of objectList) {
        switch (object.type) {
            // case "AVATAR":
            //     break;
            case "BUTTON":
                drawButton(board, object);
                break;
            case "CONTAINER":
                drawRectangle(board, object);
                break;
            case "IMAGE":
                drawImage(board, object);
                break;
            case "SWITCH":
                drawSwitch(board, object);
                break;
            default:
                errCode = 1;
        }
    }
    canvas.renderAll();
    return errCode;
}

/* Generating components */
// type: CONTAINER
const drawRectangle = function(board, object) {
    var returnObject = new fabric.Rect({
        id: object.id,
        parentId: board.id,
        left: board.get('left') + object.data.position.x,
        top: board.get('top') + object.data.position.y,
        width: object.data.width,
        height: object.data.height,
        fill: "#DDDDDD",
        strokeWidth: 1,
        stroke: "#000000"
    });
    board.children.push(returnObject);
    canvas.add(returnObject);
}
// type: IMAGE
const drawImage = function(board, object) {
    var frame = new fabric.Rect({
        width: object.data.width,
        height: object.data.height,
        fill: "#FFFFFF",
        stroke: "#000000",
        strokeWidth: 1,
    });
    var line1 = new fabric.Line([0, 0, object.data.width, object.data.height], {
        strokeWidth: 1,
        stroke: "#000000"
    });
    var line2 = new fabric.Line([0, object.data.height, object.data.width, 0], {
        strokeWidth: 1,
        stroke: "#000000"
    });
    var img = new fabric.Group([frame, line1, line2], {
        left: board.get('left') + object.data.position.x,
        top: board.get('top') + object.data.position.y
    })
    board.children.push(img);
    canvas.add(img);
}
// type: SWITCH
const drawSwitch = function(board, object) {
    let switchRadius;
    switch (object.data.size) {
        case "S":
            switchRadius = 5;
            break;
        case "M":
            switchRadius = 10;
            break;
        case "L":
            switchRadius = 20;
            break;
        default:
            switchRadius = 30;
    }
    var SwitchCover = new fabric.Rect({
        height: (switchRadius)*2,
        width: (switchRadius-1)*4,
        rx: switchRadius,
        ry: switchRadius,
        fill: "#999999"
    });
    var SwitchKnob = new fabric.Circle({
        radius: switchRadius - 2,
        fill: "#FFFFFF",
        stroke: "000000",
        strokeWidth: 1,
        top: 2,
        left: 2

    });
    var theSwitch = new fabric.Group([SwitchCover, SwitchKnob], {
        id: object.id,
        parentId: board.id,
        left: board.get('left') + object.data.position.x,
        top: board.get('top') + object.data.position.y,
    });
    board.children.push(theSwitch);
    canvas.add(theSwitch);
}
// type: BUTTON
const drawButton = function(board, object) {
    var theButton = new fabric.Rect({
        width: object.data.width,
        height: object.data.height,
        left: board.get('left') + object.data.position.x,
        top: board.get('top') + object.data.position.y,
        fill: "#EEEEEE",
        stroke: "#000000",
        strokeWidth: 1,
        rx: object.data.width,
    });
    board.children.push(theButton);
    canvas.add(theButton);
}
