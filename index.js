const initCanvas = (id) => {
    return new fabric.Canvas(id, {
        width: 1000,
        height: 1000,
        selection: false,
    });
}

const setBackground = (url, canvas) => {
    // fabric.Image.fromURL(url, (img) => {
    //     canvas.backgroundImage = img;
    //     canvas.renderAll();
    // })

    canvas.setBackgroundColor('rgba(240,240,240,0.6)')
    canvas.renderAll();
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
    })
    
    canvas.on('mouse:up', (e) => {
        mousePressed = false;
        let lst_obj = objectExtractions(canvas, canvas.getObjects())
        console.log(stringtifyObjectList(lst_obj))
    })
}


var lst_obj = []
const objectExtractions = (canvas, lstObjectsFromCanvas) => {
    const canvCenter = canvas.getCenter();

    lst_obj = []
    lstObjectsFromCanvas.forEach((object) => {
        lst_obj.push({
            width: object.width,
            height: object.height,
            posX: canvCenter.left - object.left,
            posY: canvCenter.top - object.top,
        })
    })

    console.log(lst_obj)

    return lst_obj
}

const stringtifyObjectList = (lstObjects) => {
    document.querySelector("#json-textarea").value = "[" + lstObjects.map((obj) => JSON.stringify(obj)).join(',') + "]"
}

const canvas = initCanvas('canvas');
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

    leftPosition = (posX === undefined) ? canvCenter.left - width / 2 : canvCenter.left - posX
    topPosition = (posY === undefined) ? canvCenter.top - height / 2 : canvCenter.top - posY
    console.log(leftPosition, topPosition)
    const rect = new fabric.Rect({
        width: width,
        height: height,
        fill: "gray",
        left: leftPosition,
        top: topPosition,
    })
    canvas.add(rect)
    canvas.renderAll()
    // console.log(rect.toJSON())
    // rect.on('mouse:down', (event) => {
    //     console.log('clicked on rect')
    // })
}

const parseObj = () => {
    canvasParse(document.querySelector("#json-textarea").value)
}

const addRect = (canvas) => {
    const canvCenter = canvas.getCenter();

    defaultWidth = 200;
    defaultHeight = 100;

    const rect = new fabric.Rect({
        width: defaultWidth,
        height: defaultHeight,
        fill: "gray",
        left: canvCenter.left - defaultWidth / 2,
        top: canvCenter.top - defaultHeight / 2,
    })

    canvas.add(rect)
    canvas.renderAll()
}