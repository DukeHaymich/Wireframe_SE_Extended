import * as CANVAS from "/lib/canvas_init.js";

var errCodeCounter = 0;
export const ERRCODE = Object.freeze({
    SUCCESS: errCodeCounter++,
    ZERO_SIZE: errCodeCounter++,
    UNSUPPORTED: errCodeCounter++
});

/*** Work with components ***/
export var newObject = {
    id: 2,
    board: 0,
    avatar: 0,
    button: 0,
    chart: 0,
    checkbox: 0,
    container: 0,
    divider: 0,
    image: 0,
    radio: 0,
    rating: 0,
    switch: 0,
    text: 0,
    textarea: 0,
    textbox: 0
}

/* Resolving objects' parent-child hierarchy into flat array */
export function objectInputParser() {
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
                args[0].childrenId = [];
                for (var object of args[0].children) {
                    object.data.position.x += args[0].data.position.x;
                    object.data.position.y += args[0].data.position.y;
                    args[0].childrenId.push(object.id);
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

/* Create and/or return if board exists */
export function initBoard(boardId) {
    var board;
    if (CANVAS.canvas.getObjects().some(function(obj) {
        if(obj.id === boardId) {
            board = obj;
            return true;
        }
    }));
    if (board) { // Clear objects on the existed board and return
        CANVAS.canvas.getObjects().forEach((object) => {
            if (object.boardId === board.id)
                CANVAS.canvas.remove(object);
        });
        return;
    }
    var posX = newObject.board%5 * 1500,
        posY = Math.floor(newObject.board/5) * 1000;
    board = new fabric.Rect({
        id: boardId,
        wireframeType: "BOARD",
        boardId: -1,
        parentId: -1,
        childrenId: [],
        width: 1440,
        height: 900,
        left: posX,
        top: posY,
        fill: "white",
        stroke: "rgba(100, 100, 100, 0.5)",
        strokeWidth: 1,
        strokeUniform: true,
        shadow: new fabric.Shadow({
            color: "#000000",
            blur: 15
        })
    });
    newObject.board++;
    CANVAS.canvas.add(board);
    var scale = CANVAS.canvas.width/board.width*0.85;
    CANVAS.canvas.setZoom(scale);
    CANVAS.canvas.setViewportTransform([
        scale,
        0,
        0,
        scale,
        (CANVAS.canvas.width - board.width*scale)/2 - board.left*scale,
        (CANVAS.canvas.height - board.height*scale)/2 - board.top*scale
    ]);
}

/* Get board */
export function getBoard(boardId) {
    var board = null;
    CANVAS.canvas.getObjects().some(function(obj) {
        if(obj.id === boardId) {
            board = obj;
            return true;
        }
    });
    return board;
}

/* Rendering canvas */
export function renderCanvas(boardId, objectList) {
    let errCode = ERRCODE.SUCCESS;
    var unsupportedList = new Set();
    
    initBoard(boardId);
    var board = getBoard(boardId);
    
    for (const object of objectList) {
        newObject.id = Math.max(newObject.id, object.id + 1);
        switch (object.type) {
            case "AVATAR":
                errCode = Math.max(errCode, drawAvatar(board, object));
                break;
            case "BUTTON":
                errCode = Math.max(errCode, drawButton(board, object));
                break;
            case "COLUMN_BAR_CHART":
                errCode = Math.max(errCode, drawChart(board, object));
                break;
            case "CHECKBOX":
                errCode = Math.max(errCode, drawCheckbox(board, object));
                break;
            case "CONTAINER":
                errCode = Math.max(errCode, drawContainer(board, object));
                break;
            case "DIVIDER":
                errCode = Math.max(errCode, drawDivider(board, object));
                break;
            case "IMAGE":
                errCode = Math.max(errCode, drawImage(board, object));
                break;
            case "RADIO":
                errCode = Math.max(errCode, drawRadio(board, object));
                break;
            case "RATING":
                errCode = Math.max(errCode, drawRating(board, object));
                break;
            case "SWITCH":
                errCode = Math.max(errCode, drawSwitch(board, object));
                break;
            case "TEXT":
                errCode = Math.max(errCode, drawText(board, object));
                break;
            case "TEXTAREA":
            case "TEXTBOX":
                errCode = Math.max(errCode, drawInput(board, object));
                break;
            default:
                errCode = Math.max(errCode, ERRCODE.UNSUPPORTED);
                unsupportedList.add(object.type);
                
        }
    }
    unsupportedList.size && console.log("Unsupported objects:", ...unsupportedList);
    CANVAS.canvas.renderAll();
    CANVAS.updateModifications();
    return errCode;
}

/* Generating components */
function dataSize(objectSize, coeff) {
    let ans;
    switch (objectSize) {
        case "S":
            ans = 1;
            break;
        case "M":
            ans = 2;
            break;
        case "L":
            ans = 4;
            break;
        default:
            ans = 0;
    }
    return coeff * ans;
}
// type: AVATAR
export function drawAvatar(board, object) {
    const STYLE = Object.freeze({
        ICON: "ICON",
        IMAGE: "IMAGE",
    });
    let avatarRadius = dataSize(object.data.size, 12);
    let style1 = [
        new fabric.Line([avatarRadius, 0, avatarRadius, avatarRadius*2], {
            strokeWidth: 1,
            stroke: "#000000",
            strokeUniform: true,
            originX: "center",
            originY: "center",
            left: 0,
            top: 0,
            angle: 45
        }),
        new fabric.Line([avatarRadius, 0, avatarRadius, avatarRadius*2], {
            strokeWidth: 1,
            stroke: "#000000",
            strokeUniform: true,
            originY: "center",
            originX: "center",
            left: 0,
            top: 0,
            angle: -45,
        })
    ];
    let style2 = [
        new fabric.Text(object.data.text[0].toUpperCase(), {
            fontFamily: "Fira Sans, sans-serif",
            fontSize: avatarRadius,
            originX: "center",
            originY: "center"
        })
    ];
    var style;
    switch (object.data.style) {
        case STYLE.IMAGE:
            style = style1;
            break;
        case STYLE.ICON:
            style = style2;
            break;
        default:
            style = [];
    }
    let theAvatar = new fabric.Group([
        new fabric.Circle({
            radius: avatarRadius,
            fill: "rgba(255,255,255,1)",
            strokeWidth: 1,
            stroke: "#000000",
            strokeUniform: true,
            originX: "center",
            originY: "center"
        }),
        ...style,
    ], {
        id: object.id,
        wireframeType: object.type,
        parentId: object.parentId,
        childrenId: object.childrenId,
        boardId: board.id,
        left: board.left + object.data.position.x,
        top: board.top + object.data.position.y,
    });
    CANVAS.canvas.add(theAvatar);
    return ERRCODE.SUCCESS;
}
// type: BUTTON
export function drawButton(board, object) {
    let buttonSize = dataSize(object.data.size, 15);
    let buttonBorderRadius = dataSize(object.data.borderRadius, 3.5);
    if (buttonSize === 0) return ERRCODE.ZERO_SIZE;
    let buttonText = new fabric.Text(object.data.text, {
        fontFamily: "Fira Sans, sans-serif",
        fontSize: buttonSize*0.5,
        originX: "center",
        originY: "center"
    });
    let theButton = new fabric.Group([
        new fabric.Rect({
            width: object.data.width || buttonText.width + buttonSize*0.75,
            height: buttonSize,
            originX: "center",
            originY: "center",
            fill: "#EDEDED",
            stroke: "#000000",
            strokeWidth: 1,
            strokeUniform: true,
            rx: buttonBorderRadius,
            ry: buttonBorderRadius
        }),
        buttonText], {
        id: object.id,
        wireframeType: object.type,
        parentId: object.parentId,
        childrenId: object.childrenId,
        boardId: board.id,
        left: board.left + object.data.position.x,
        top: board.top + object.data.position.y,
    });
    CANVAS.canvas.add(theButton);
    return ERRCODE.SUCCESS;
}
// type: CHART
export function drawChart(board, object) {
    let chartWidth = object.data.width;
    let chartHeight = object.data.height;
    let theChart = new fabric.Group([
        new fabric.Line([0, 0, 0, chartHeight], {
            strokeWidth: 2,
            stroke: "#000000",
            strokeUniform: true
        }),
        new fabric.Line([0, chartHeight, chartWidth, chartHeight], {
            strokeWidth: 2,
            stroke: "#000000",
            strokeUniform: true
        })
    ], {
        id: object.id,
        wireframeType: object.type,
        parentId: object.parentId,
        childrenId: object.childrenId,
        boardId: board.id,
        left: board.left + object.data.position.x,
        top: board.top + object.data.position.y,
    });
    switch (object.data.style) {
        case "CLUSTERED_COLUMN":
            let clusterLength = object.data.groupsData.length;
            let columnWidth = chartWidth/(clusterLength*5 + 1)*2;
            for (let i = 0; i < clusterLength; ++i) {
                theChart.addWithUpdate(
                    new fabric.Rect({
                        left: theChart.left + columnWidth/2 + i*columnWidth*2.5,
                        top: theChart.top + chartHeight,
                        originY: "bottom",
                        width: columnWidth,
                        height: chartHeight*0.9*object.data.groupsData[i].firstVolumn,
                        fill: "#AAAAAA"
                    })
                );
                theChart.addWithUpdate(
                    new fabric.Rect({
                        left: theChart.left + columnWidth/2*3 + i*columnWidth*2.5,
                        top: theChart.top + chartHeight,
                        originY: "bottom",
                        width: columnWidth,
                        height: chartHeight*0.9*object.data.groupsData[i].secondVolumn,
                        fill: "#777777"
                    })
                );
            }
            break;
        default:
            return ERRCODE.UNSUPPORTED;
    }
    CANVAS.canvas.add(theChart);
    return ERRCODE.SUCCESS;
}
// type: CHECKBOX
export function drawCheckbox(board, object) {
    let checkboxSize = dataSize(object.data.size, 8);
    if (checkboxSize === 0) return ERRCODE.ZERO_SIZE;
    let checkboxLabel = new fabric.Text(object.data.label, {
        fontFamily: "Fira Sans, sans-serif",
        fontSize: object.data.enableLabel ? checkboxSize*1.5 : 0,
        fontWeight: "bold"
    });
    let checkButtons = [];
    let checkboxTexts = [];
    let longestText = 0;
    for (const i of object.children) {
        let checkButton = new fabric.Rect({
            width: checkboxSize,
            height: checkboxSize,
            stroke: "#000000",
            strokeWidth: checkboxSize/9,
            strokeUniform: true,
            fill: "#FFFFFF",
        });
        if (i.data.selectionStatus === "SELECTED") {
            checkButton = new fabric.Group([checkButton, new fabric.Text("✓", {
                fontFamily: "Wingdings",
                fontWeight: 900,
                fontSize: checkboxSize*0.9,
                left: checkboxSize*0.2,
                top: checkboxSize*0.075,
            })]);
        } else if (i.data.selectionStatus === "INDETERMINATE") {
            checkButton = new fabric.Group([checkButton, new fabric.Rect({
                width: checkboxSize*0.65,
                height: checkboxSize*0.65,
                left: checkboxSize*0.2,
                top: checkboxSize*0.2,
                fill: "#000000"
            })]);
        }
        checkButtons.push(checkButton);
        let checkboxText = new fabric.Text(i.data.text, {
            fontFamily: "Fira Sans, sans-serif",
            fontSize: checkboxSize,
        });
        let textWidth = checkboxText.width;
        longestText = Math.max(longestText, textWidth);
        checkboxTexts.push(checkboxText);
    }
    switch (object.data.direction) {
        case "VERTICAL_RIGHT":
            for (const i of Array(object.children.length).keys()) {
                let objChild = object.children[i];
                checkButtons[i].set({
                    left: objChild.data.position.x + longestText + 10,
                    top: objChild.data.position.y,
                    originY: "center"
                });
                checkboxTexts[i].set({
                    left: objChild.data.position.x,
                    top: objChild.data.position.y,
                    originY: "center"
                });
            }
            break;
        default: //"VERTICAL_LEFT"
            for (const i of Array(object.children.length)) {
                let objChild = object.children[i];
                checkButtons[i].set({
                    left: objChild.data.position.x,
                    top: objChild.data.position.y,
                    originY: "center"
                });
                checkboxTexts[i].set({
                    left: objChild.data.position.x + checkboxSize*2 + 5,
                    top: objChild.data.position.y,
                    originY: "center"
                });
            }
    }
    let checkboxList = new fabric.Group([...checkButtons, ...checkboxTexts], {
        top: checkboxLabel.height + (!!checkboxLabel.height)*checkboxSize,
    });
    let theCheckbox = new fabric.Group([checkboxLabel, checkboxList], {
        id: object.id,
        wireframeType: object.type,
        parentId: object.parentId,
        childrenId: object.childrenId,
        boardId: board.id,
        left: board.left + object.data.position.x,
        top: board.top + object.data.position.y,
    })
    CANVAS.canvas.add(theCheckbox);
    return ERRCODE.SUCCESS;
}
// type: CONTAINER
export function drawContainer(board, object) {
    let theContainer = new fabric.Rect({
        id: object.id,
        wireframeType: object.type,
        parentId: object.parentId,
        childrenId: object.childrenId,
        boardId: board.id,
        left: board.left + object.data.position.x,
        top: board.top + object.data.position.y,

        width: object.data.width,
        height: object.data.height,
        fill: "rgba(164,164,164,0.5)",
        strokeWidth: dataSize(object.data.borderWidth, 1),
        stroke: "#000000",
        strokeUniform: true
    });
    CANVAS.canvas.add(theContainer);
    return ERRCODE.SUCCESS;
}
// type: DIVIDER
export function drawDivider(board, object) {
    let theDivider = new fabric.Line([
        object.data.from.x,
        object.data.from.y,
        object.data.to.x,
        object.data.to.y
    ], {
        id: object.id,
        wireframeType: object.type,
        parentId: object.parentId,
        childrenId: object.childrenId,
        boardId: board.id,
        left: board.left + object.data.position.x,
        top: board.top + object.data.position.y,

        strokeWidth: object.data.lineWidth,
        stroke: "NEUTRAL",
        strokeUniform: true
    });
    CANVAS.canvas.add(theDivider);
    return ERRCODE.SUCCESS;
}
// type: IMAGE
export function drawImage(board, object) {
    let lineWidth = Math.max(object.data.width, object.data.height)/125;
    let objWidth = object.data.width - lineWidth;
    let objHeight = object.data.height - lineWidth;
    let style = (1 <= objWidth/objHeight && objWidth/objHeight <= 3) ? 2 : 1;
    let style1 = [
        new fabric.Rect({
            width: objWidth,
            height: objHeight,
            fill: "#FFFFFF",
            stroke: "#000000",
            strokeWidth: lineWidth,
            strokeUniform: true
        }),
        new fabric.Line([0, 0, objWidth, objHeight], {
            strokeWidth: lineWidth,
            stroke: "#000000",
            strokeUniform: true
        }), new fabric.Line([0, objHeight, objWidth, 0], {
            strokeWidth: lineWidth,
            stroke: "#000000",
            strokeUniform: true
        })
    ];
    let style2 = [
        new fabric.Rect({
            width: objWidth,
            height: objHeight,
            fill: "#FFFFFF",
            stroke: "#000000",
            strokeWidth: lineWidth,
            strokeUniform: true
        }),
        new fabric.Polygon([
            new fabric.Point(lineWidth*6, objHeight - lineWidth*5),
            new fabric.Point(lineWidth*6, objHeight*4/5),
            new fabric.Point(objWidth/3, objHeight/2),
            new fabric.Point(objWidth/2, objHeight*2/3),
            new fabric.Point(objWidth*3/4, objHeight/4),
            new fabric.Point(objWidth - lineWidth*5, objHeight*5/9),
            new fabric.Point(objWidth - lineWidth*5, objHeight - lineWidth*5),
        ], {
            stroke: "#000000",
            strokeWidth: lineWidth,
            strokeUniform: true,
            fill: "#EEEEEE"
        }),
        new fabric.Circle({
            radius: objHeight/9,
            left: objWidth/8,
            top: objHeight/7,
            fill: "#EEEEEE",
            strokeWidth: lineWidth,
            stroke: "#000000",
            strokeUniform: true
        })
    ]
    let theImage = new fabric.Group((style === 1 ? style1 : style2), {
        id: object.id,
        wireframeType: object.type,
        parentId: object.parentId,
        childrenId: object.childrenId,
        boardId: board.id,
        left: board.left + object.data.position.x,
        top: board.top + object.data.position.y
    })
    CANVAS.canvas.add(theImage);
    return ERRCODE.SUCCESS;
}
// type: RADIO
export function drawRadio(board, object) {
    let radioSize = dataSize(object.data.size, 4);
    if (radioSize === 0) return ERRCODE.ZERO_SIZE;
    let radioLabel = new fabric.Text(object.data.label, {
        fontFamily: "Fira Sans, sans-serif",
        fontSize: object.data.enableLabel ? radioSize*3 : 0,
        fontWeight: "bold"
    });
    let radioButtons = [];
    let radioTexts = [];
    let longestText = 0;
    for (const i of object.children) {
        let radioButton = new fabric.Circle({
            radius: radioSize,
            stroke: "#000000",
            strokeWidth: radioSize/4,
            strokeUniform: true,
            fill: "#FFFFFF"
        });
        if (i.data.selectionStatus === "SELECTED") {
            let selected = dataSize(object.data.size, 1.5);
            radioButton = new fabric.Group([radioButton, new fabric.Circle({
                radius: radioSize - selected,
                fill: "#000000",
                left: radioSize*9/8,
                top: radioSize*9/8,
                originX: "center",
                originY: "center"
            })]);
        }
        radioButtons.push(radioButton);
        let radioText = new fabric.Text(i.data.text, {
            fontFamily: "Fira Sans, sans-serif",
            fontSize: radioSize*2.5,
        });
        let textWidth = radioText.width;
        longestText = Math.max(longestText, textWidth);
        radioTexts.push(radioText);
    }
    switch (object.data.direction) {
        case "VERTICAL_RIGHT":
            for (const i of Array(object.children.length).keys()) {
                let objChild = object.children[i];
                radioButtons[i].set({
                    left: objChild.data.position.x + longestText + 10,
                    top: objChild.data.position.y,
                    originY: "center"
                });
                radioTexts[i].set({
                    left: objChild.data.position.x,
                    top: objChild.data.position.y,
                    originY: "center"
                });
            }
            break;
        default: //"VERTICAL_LEFT"
            for (const i of Array(object.children.length)) {
                let objChild = object.children[i];
                radioButtons[i].set({
                    left: objChild.data.position.x,
                    top: objChild.data.position.y,
                    originY: "center"
                });
                radioTexts[i].set({
                    left: objChild.data.position.x + radioSize*2 + 5,
                    top: objChild.data.position.y,
                    originY: "center"
                });
            }
    }
    let radioList = new fabric.Group([...radioButtons, ...radioTexts], {
        top: radioLabel.height + (!!radioLabel.height)*radioSize/2,
    });
    let theRadio = new fabric.Group([radioLabel, radioList], {
        id: object.id,
        wireframeType: object.type,
        parentId: object.parentId,
        childrenId: object.childrenId,
        boardId: board.id,
        left: board.left + object.data.position.x,
        top: board.top + object.data.position.y,
    })
    CANVAS.canvas.add(theRadio);
    return ERRCODE.SUCCESS;
}
// type: RATING
export function drawRating(board, object) {
    let starScale = dataSize(object.data.size, 2);
    if (starScale === 0) return ERRCODE.ZERO_SIZE;
    let starSep = dataSize(object.data.size, 17.5);
    let theRating = new fabric.Group([]);
    fabric.loadSVGFromURL("./lib/img/full_star.svg", function(objects, options) {
        let obj = fabric.util.groupSVGElements(objects, options);
        let score = object.data.rating;
        let nFullStar = Math.floor(score/2);
        let nHalfStar = Math.ceil(score/2);
        let nEmptyStar = object.data.numberOfOptions;
        let i = 0;
        obj.scale(starScale);
        for (; i < nFullStar; ++i) {
            obj.clone(function(i) {
                return function(clone) {
                    clone.set({
                        left: i*starSep,
                        top: 0,
                        originX: "right",
                        originY: "bottom"
                    });
                    theRating.addWithUpdate(clone);
                }
            }(i));
        }
        fabric.loadSVGFromURL("./lib/img/half_star.svg", function(objects, options) {
            let obj = fabric.util.groupSVGElements(objects, options);
            obj.scale(starScale);
            for (; i < nHalfStar; ++i) {
                obj.clone(function(i) {
                    return function(clone) {
                        clone.set({
                            left: i*starSep,
                            top: 0,
                            originX: "right",
                            originY: "bottom"
                        });
                        theRating.addWithUpdate(clone);
                    }
                }(i));
            }
            fabric.loadSVGFromURL("./lib/img/empty_star.svg", function(objects, options) {
                let obj = fabric.util.groupSVGElements(objects, options);
                obj.scale(starScale);
                for (; i < nEmptyStar; ++i) {
                    obj.clone(function(i) {
                        return function(clone) {
                            clone.set({
                                left: i*starSep,
                                top: 0,
                                originX: "right",
                                originY: "bottom"
                            });
                            theRating.addWithUpdate(clone);
                        }
                    }(i));
                }
                theRating.set({
                    id: object.id,
                    wireframeType: object.type,
                    parentId: object.parentId,
                    childrenId: object.childrenId,
                    boardId: board.id,
                    left: board.left + object.data.position.x,
                    top: board.top + object.data.position.y,
                });
                CANVAS.canvas.add(theRating);
            });
        });
    });
    return ERRCODE.SUCCESS;
}
// type: SWITCH
export function drawSwitch(board, object) {
    let switchRadius = dataSize(object.data.size, 7.5);
    if (switchRadius === 0) return ERRCODE.ZERO_SIZE;
    let SwitchCover = new fabric.Rect({
        height: (switchRadius)*2,
        width: (switchRadius-1)*4,
        rx: switchRadius,
        ry: switchRadius,
        fill: (object.data.status === "ON" ? "#00FF00" : "#999999")
    });
    let SwitchKnob = new fabric.Circle({
        radius: switchRadius - 2,
        fill: "#FFFFFF",
        stroke: "000000",
        strokeWidth: 1,
        strokeUniform: true,
        top: 2,
        left: (object.data.status === "ON" ? switchRadius*2-2 : 2)

    });
    let theSwitch = new fabric.Group([SwitchCover, SwitchKnob], {
        id: object.id,
        wireframeType: object.type,
        parentId: object.parentId,
        childrenId: object.childrenId,
        boardId: board.id,
        left: board.left + object.data.position.x,
        top: board.top + object.data.position.y,
    });
    CANVAS.canvas.add(theSwitch);
    return ERRCODE.SUCCESS;
}
// type: TEXT
export function drawText(board, object) {
    let textSize = 0;
    let textPreset = object.data.preset.toLowerCase();
    switch (textPreset) {
        case "heading":
            textSize = dataSize(object.data.size, 25);
            break;
        case "body text":
        case "link":
            textSize = dataSize(object.data.size, 10);
            break;
        default:
            return ERRCODE.UNSUPPORTED;
    }
    let highAbstract = false;
    let theText = new fabric.Textbox(object.data.text, {
        fontFamily: "Fira Sans, sans-serif",
        fontSize: textSize,
        underline: object.data.underline,
        textAlign: object.data.textAlign ?? "left",
        fill: highAbstract ? "#444444" : "#000000",
        backgroundColor: highAbstract ? "#444444" : "rgba(0,0,0,0)",
        width: object.data.width ?? textSize/2*object.data.text.length,
        height: object.data.height,
        fontWeight: textPreset === "heading" ? "bold" : "normal",

        id: object.id,
        wireframeType: object.type,
        parentId: object.parentId,
        childrenId: object.childrenId,
        boardId: board.id,
        left: board.left + object.data.position.x,
        top: board.top + object.data.position.y,
    });
    CANVAS.canvas.add(theText);
    return ERRCODE.SUCCESS;
}
// type: TEXTBOX/TEXTAREA
export function drawInput(board, object) {
    let textSize = dataSize(object.data.size, 10);
    let inputLabel = new fabric.Text(object.data.label, {
        fontFamily: "Fira Sans, sans-serif",
        fontSize: object.data.enableLabel ? textSize : 0,
        fontWeight: "bold"
    });
    let verticalSpacing = inputLabel.height + (!!inputLabel.height)*textSize/2;
    let inputBoxWidth = object.data.width || textSize*15;
    let inputBoxHeight = (object.data.height - verticalSpacing) || textSize*3 - verticalSpacing;
    let inputBox = new fabric.Group([
        new fabric.Rect({
            width: inputBoxWidth,
            height: inputBoxHeight,
            fill: "#FFFFFF",
            stroke: "#000000",
            strokeWidth: textSize/10,
            strokeUniform: true
        }),
        new fabric.Textbox(object.data.text, {
            fontFamily: "Fira Sans, sans-serif",
            fontSize: textSize,
            width: inputBoxWidth - textSize,
            fill: object.data.enablePlaceholder ? "#333333" : "rgba(0,0,0,0)",
            scaleY: 1,
            left: textSize,
            top: textSize*0.2,
        })
    ], {
        top: verticalSpacing,
    });
    let theInput = new fabric.Group([inputLabel, inputBox], {
        id: object.id,
        wireframeType: object.type,
        parentId: object.parentId,
        childrenId: object.childrenId,
        boardId: board.id,
        left: board.left + object.data.position.x,
        top: board.top + object.data.position.y,
    });
    CANVAS.canvas.add(theInput);
    return ERRCODE.SUCCESS;
}

/* For development */
export function drawDebugLine(boardId, objectId) {
    let board = CANVAS.canvas.getObjects().find((obj) => {
        return obj.id === boardId;
    });
    let debugObject = CANVAS.canvas.getObjects().find((obj) => {
        return obj.id === objectId;
    });
    let debugPosX = debugObject.left;
    let debugPosY = debugObject.top;
    let theDebugLine = new fabric.Line([board.left, board.top, debugPosX, debugPosY], {
        strokeWidth: 1,
        stroke: "#FF0000",
        strokeUniform: true
    });
    CANVAS.canvas.add(theDebugLine);
    return ERRCODE.SUCCESS;
}

