import { initCenteringGuidelines } from "/lib/centering_guidelines.js";
import { initAligningGuidelines } from "/lib/aligning_guidelines.js";
import { initBoard } from "/lib/wireframe.js";



/*** Initiate canvas and drawing area ***/
export const canvasPad = document.querySelector(".canvas-container");
export const canvas = new fabric.Canvas("canvas", {
    id: -1,
    width: canvasPad.clientWidth,
    height: canvasPad.clientHeight,
    fireRightClick: true,
    fireMiddleClick: true,
    stopContextMenu: true,
    preserveObjectStacking: true,
    selectionFullyContained: true,
});
initCenteringGuidelines(canvas);
initAligningGuidelines(canvas);
initBoard(1);

/* Responsive canvas */
window.addEventListener("resize", function() {
    canvas.setDimensions({
        width: canvasPad.clientWidth,
        height: canvasPad.clientHeight
    });
});



/*** Handle canvas events ***/
/* Zooming at cursor */
canvas.on("mouse:wheel", function(event) {
    var delta = event.e.deltaY;
    var zoom = canvas.getZoom();
    zoom *= 0.999 ** delta;
    if (zoom > 10) zoom = 10;
    if (zoom < 0.1) zoom = 0.1;
    canvas.zoomToPoint({ x: event.e.offsetX, y: event.e.offsetY }, zoom);
    event.e.preventDefault();
    event.e.stopPropagation();
});

/* Panning with middle-click and right-click */
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
    if (event.button === 2 || event.button === 3) {
        mousePressed = true;
        event.e.preventDefault();
        event.e.stopPropagation();
    }
});
canvas.on('mouse:up', function(event) {
    if (event.button === 2 || event.button === 3) {
        mousePressed = false;
        event.e.preventDefault();
        event.e.stopPropagation();
    }
});

/* Undo-redo */
var state = [JSON.stringify(canvas.toJSON(["id", "wireframeType", "boardId", "parentId", "childrenId"]))];
var mods = 0;
export function updateModifications() {
    let myjson = JSON.stringify(canvas.toJSON(["id", "wireframeType", "boardId", "parentId", "childrenId"]));
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
    if (event.ctrlKey && event.key === 'z' && document.getElementById("json") !== document.activeElement) {
        if (mods < state.length - 1) {
            mods += 1;
            canvas.loadFromJSON(state[state.length - 1 - mods]);
            canvas.renderAll();
        }
        event.preventDefault();
        event.stopPropagation();
    }
    // Redo
    if (event.ctrlKey && event.key === 'y' && document.getElementById("json") !== document.activeElement) {
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
/* Child objects transform with parent (move, rotate, scale) */
function setRelation() {
    let boss = canvas.getActiveObjects();
    if (boss.length !== 1) return;
    boss = boss[0];

    var minions = boss.wireframeType === "BOARD"
        ? canvas.getObjects().filter(o => o.boardId === boss.id)
        : canvas.getObjects().filter(o => o.parentId === boss.id);
    
    minions.forEach(o => {
        var desiredTransform = fabric.util.multiplyTransformMatrices(
            fabric.util.invertTransform(boss.calcTransformMatrix()),
            o.calcTransformMatrix()
        );
        o.relationship = desiredTransform;
    });
}
function childTransform() {
    let boss = canvas.getActiveObjects();
    if (boss.length !== 1) return;
    boss = boss[0];
    
    var minions = boss.wireframeType === "BOARD"
        ? canvas.getObjects().filter(o => o.boardId === boss.id)
        : canvas.getObjects().filter(o => o.parentId === boss.id);

    minions.forEach(o => {
        if (!o.relationship) return;
        var newTransform = fabric.util.multiplyTransformMatrices(
            boss.calcTransformMatrix(),
            o.relationship
        );
        var opt = fabric.util.qrDecompose(newTransform);
        o.set({
            flipX: false,
            flipY: false,
        });
        o.setPositionByOrigin(
            { x: opt.translateX, y: opt.translateY },
            'center',
            'center'
        );
        o.set(opt);
        o.setCoords();
    });
}
canvas.on({
    "object:moving": childTransform,
    "object:rotating": childTransform,
    "object:scaling": childTransform,
    "selection:created": setRelation,
    "selection:updated": setRelation
});

/* Removing selected objects */
document.addEventListener('keydown', function(event) {
    if (event.key === "Delete" && document.getElementById("json") !== document.activeElement) {
        let selGroup = new fabric.ActiveSelection(canvas.getActiveObjects(), {
            canvas: canvas
        });
        if (selGroup) {
            selGroup.forEachObject(function(object) {
                var minions = object.wireframeType === "BOARD"
                    ? canvas.getObjects().filter(o => o.boardId === object.id)
                    : (event.shiftKey) ? canvas.getObjects().filter(o => o.parentId === object.id)
                                       : [];
                minions.forEach(o => {
                    canvas.remove(o);
                });
                canvas.remove(object);
            });
            canvas.discardActiveObject().renderAll();
            updateModifications();
        }
        event.preventDefault();
        event.stopPropagation();
    }
});