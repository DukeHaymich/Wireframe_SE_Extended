import * as UTIL from './lib/utility.js';

/*** Initiate canvas and drawing area ***/
const canvasPad = document.querySelector(".canvas-container");
const canvas = new fabric.Canvas("canvas", {
    width: canvasPad.clientWidth,
    height: canvasPad.clientHeight,
    fireRightClick: true,
    fireMiddleClick: true,
    stopContextMenu: true
});
var page = new fabric.Rect({
    width: canvas.width * 0.9,
    height: canvas.height * 0.8,
    fill: "white",
    shadow: new fabric.Shadow({
        color: "rgb(100, 100, 100)",
        blur: 5
    }),
});
canvas.add(page);
canvas.centerObject(page);


/*** Handle canvas events ***/
/* Zooming at cursor */
canvas.on("mouse:wheel", (event) => {
    var delta = event.e.deltaY;
    var zoom = canvas.getZoom();
    zoom *= 0.999 ** delta;
    if (zoom > 20) zoom = 20;
    if (zoom < 0.1) zoom = 0.1;
    canvas.zoomToPoint({ x: event.e.offsetX, y: event.e.offsetY }, zoom);
    event.e.preventDefault();
    event.e.stopPropagation();
});
/* Panning with middle click */
let mousePressed = false;
canvas.on('mouse:move', (event) => {
    if (mousePressed) {
        const mEvent = event.e;
        canvas.relativePan(new fabric.Point(mEvent.movementX, mEvent.movementY));
        mEvent.preventDefault();
        mEvent.stopPropagation();
    }
});
canvas.on('mouse:down', (event) => {
    if (event.button === 2) {
        mousePressed = true;
    }
});
canvas.on('mouse:up', (event) => {
    if (event.button === 2) {
        mousePressed = false;
    }
});

/*** Work with JSON ***/
const JSONtextarea = document.getElementById("json");
const importButton = document.getElementById("importBtn");
importButton.addEventListener("click", () => {
    var objectList = UTIL.JSONParser(JSONtextarea.value);
    if (objectList === null) {
        console.log("yeah");
    } else {
        console.log("no");
    }
});

/*** Generating components ***/