const initCanvas = (id) => {
    return new fabric.Canvas(id, {
        width: window.innerWidth * 0.6,
        height: window.innerHeight,
    });
}

const setBackground = (url, canvas) => {
    fabric.Image.fromURL(url, (img) => {
        canvas.backgroundImage = img;
        canvas.renderAll();
    })
}

const toggleMode = (mode) => {
    if (mode === modes.pan) {
        if (currentMode === modes.pan) {
            currentMode = ""
        } else {
            currentMode = modes.pan
            canvas.isDrawingMode = false
        }
    } else if (mode === modes.drawing) {
        if (currentMode === modes.drawing) {
            currentMode = ""
            canvas.isDrawingMode = false
        } else {
            currentMode = modes.drawing
            canvas.isDrawingMode = true
        }
    }
}

const setPanEvents = (canvas) => {
    canvas.on('mouse:move', (e) => {
        // console.log(e.layerX);
        if (mousePressed && currentMode === modes.pan) {
            const mEvent = e.e;
            // canvas.setCursor('crosshair');
            // canvas.renderAll();
            const delta = new fabric.Point(mEvent.movementX, mEvent.movementY);
            canvas.relativePan(delta);
        } else if (mousePressed && currentMode === modes.drawing) {
            canvas.isDrawingMode = true
        }
    })
    
    
    canvas.on('mouse:down', (event) => {
        mousePressed = true;
        // if (currentMode === modes.pan) {
        //     canvas.setCursor('crosshair');
        // }
    })
    
    canvas.on('mouse:up', (event) => {
        mousePressed = false;
    })
}

const canvas = initCanvas('canvas');
// const canvas = document.getElementById('canvas');
let mousePressed = false;

let currentMode;

const modes = {
    pan: 'pan',
    drawing: 'drawing',
}

setBackground('https://i.picsum.photos/id/88/200/300.jpg?hmac=JmiMN7iyW4Saka82S4HzDvbOjMSB2k9NwTN29MHWqa4', canvas);

setPanEvents(canvas);

const canvasParse = (json_text) => {
    list_canvas_obj = JSON.parse(json_text);
    list_canvas_obj.forEach((canvasJsonObj) => {
        console.log(canvasJsonObj.width, canvasJsonObj.height, canvasJsonObj.posX, canvasJsonObj.posY)
        rectangleRenderer(canvas, canvasJsonObj.width, canvasJsonObj.height, canvasJsonObj.posX, canvasJsonObj.posY)
    })
}

const rectangleRenderer = (canvas, width, height, posX, posY) => {
    const canvCenter = canvas.getCenter();

    leftPosition = (posX === "undefined") ? canvCenter.left - width / 2 : canvCenter.left - posX/2
    topPosition = (posY === "undefined") ? canvCenter.top - height / 2 : canvCenter.top - posY/2
    const rect = new fabric.Rect({
        width: width,
        height: height,
        fill: "gray",
        left: leftPosition,
        top: topPosition,
    })
    canvas.add(rect)
    canvas.renderAll()
}

const parseObj = () => {
    canvasParse(document.querySelector("#json-textarea").value)
}

