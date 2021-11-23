import * as UTIL from './lib/utility.js';
import { canvas, initBoard, updateModifications, objectParser } from './lib/canvas_init.js';

var errCodeCounter = 0;
const ERRCODE = Object.freeze({
    SUCCESS: errCodeCounter++,
    ZERO_SIZE: errCodeCounter++,
    UNSUPPORTED: errCodeCounter++
});

const boardId = 1928;

/*** Work with JSON ***/
/* Notify successful or fail execution */
const JSONtextarea = document.getElementById("json");
const notiDiv = document.querySelector(".notification");
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
document.getElementById("importBtn").addEventListener("click", () => {
    let objectList = UTIL.JSONParser(JSONtextarea.value);
    if (objectList === null) {
        notify(
            UTIL.NotifyText(
                "Error:",
                "The text you entered is not JSON type!"
            ),
            "fail",
            5000
        );
    } else {
        objectList = objectParser.apply(null, objectList);
        switch (renderCanvas(boardId, objectList)) {
            case 0:
                notify(
                    UTIL.NotifyText(
                        "Success!",
                        "The canvas is now displaying imported content."
                    ),
                    "success",
                    5000
                );
                break;
            case 1:
                notify(
                    UTIL.NotifyText(
                        "Warning:",
                        "The sizes of some objects are zero! Stop rendering these ones."
                    ),
                    "fail",
                    5000
                );
                break;
            case 2:
                notify(
                    UTIL.NotifyText(
                        "Warning:",
                        "Some of components imported are unsupported!"
                    ),
                    "fail",
                    5000
                );
                break;
        }
    }
});

/* Export from canvas */
//TODO

/* Copy to clipboard */
document.getElementById("copyBtn").addEventListener("click", function() {
    navigator.clipboard.writeText(JSONtextarea.value);
    notify(
        UTIL.NotifyText(
            "Success!",
            "The JSON is copied to your clipboard!"
        ),
        "success",
        5000
    );
});

/*** Work with components***/
/* Rendering canvas */
const renderCanvas = function(boardId, objectList) {
    let errCode = ERRCODE.SUCCESS;
    canvas.clear();
    initBoard(boardId);
    let board;
    canvas.getObjects().some(function(obj) {
        if(obj.id === boardId) {
            board = obj;
            return true;
        }
    });
    for (const object of objectList) {
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
            // case "ICON":
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
        }
    }
    canvas.renderAll();
    updateModifications();
    return errCode;
}

/* Generating components */
const dataSize = function(objectSize, coeff) {
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
const drawAvatar = function(board, object) {
    let styleOption = object.data.style === "ICON" ? 2 : 1;
    let avatarRadius = dataSize(object.data.size, 12);
    let style1 = [
        new fabric.Line([avatarRadius, 0, avatarRadius, avatarRadius*2], {
            strokeWidth: 1,
            stroke: "#000000",
            originX: "center",
            originY: "center",
            left: 0,
            top: 0,
            angle: 45
        }),
        new fabric.Line([avatarRadius, 0, avatarRadius, avatarRadius*2], {
            strokeWidth: 1,
            stroke: "#000000",
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
    switch (styleOption) {
        case 1:
            style = style1;
            break;
        case 2:
            style = style2;
            break;
        default:
            style = [];
    }
    let theAvatar = new fabric.Group([
        new fabric.Circle({
            radius: avatarRadius,
            fill: "rgba(0,0,0,0)",
            strokeWidth: 1,
            stroke: "#000000",
            originX: "center",
            originY: "center"
        }),
        ...style,
    ], {
        id: object.id,
        parentId: object.parentId,
        boardId: board.id,
        left: board.left + object.data.position.x,
        top: board.top + object.data.position.y,
    });
    canvas.add(theAvatar);
    return ERRCODE.SUCCESS;
}
// type: BUTTON
const drawButton = function(board, object) {
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
            rx: buttonBorderRadius,
            ry: buttonBorderRadius
        }),
        buttonText], {
        id: object.id,
        parentId: object.parentId,
        boardId: board.id,
        left: board.left + object.data.position.x,
        top: board.top + object.data.position.y,
    });
    canvas.add(theButton);
    return ERRCODE.SUCCESS;
}
// type: CHART
const drawChart = function(board, object) {
    let chartWidth = object.data.width;
    let chartHeight = object.data.height;
    let theChart = new fabric.Group([
        new fabric.Line([0, 0, 0, chartHeight], {
            strokeWidth: 2,
            stroke: "#000000"
        }),
        new fabric.Line([0, chartHeight, chartWidth, chartHeight], {
            strokeWidth: 2,
            stroke: "#000000"
        })
    ], {
        id: object.id,
        parentId: object.parentId,
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
    canvas.add(theChart);
    return ERRCODE.SUCCESS;
}
// type: CHECKBOX
const drawCheckbox = function(board, object) {
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
        parentId: object.parentId,
        boardId: board.id,
        left: board.left + object.data.position.x,
        top: board.top + object.data.position.y,
    })
    canvas.add(theCheckbox);
    return ERRCODE.SUCCESS;
}
// type: CONTAINER
const drawContainer = function(board, object) {
    let theContainer = new fabric.Rect({
        id: object.id,
        parentId: object.parentId,
        boardId: board.id,
        left: board.left + object.data.position.x,
        top: board.top + object.data.position.y,

        width: object.data.width,
        height: object.data.height,
        fill: "#DDDDDD",
        strokeWidth: dataSize(object.data.borderWidth, 1),
        stroke: "#000000"
    });
    canvas.add(theContainer);
    return ERRCODE.SUCCESS;
}
// type: DIVIDER
const drawDivider = function(board, object) {
    let theDivider = new fabric.Line([
        object.data.from.x,
        object.data.from.y,
        object.data.to.x,
        object.data.to.y
    ], {
        id: object.id,
        parentId: object.parentId,
        boardId: board.id,
        left: board.left + object.data.position.x,
        top: board.top + object.data.position.y,

        strokeWidth: object.data.lineWidth,
        stroke: "NEUTRAL"
    });
    canvas.add(theDivider);
    return ERRCODE.SUCCESS;
}
// type: IMAGE
const drawImage = function(board, object) {
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
        }),
        new fabric.Line([0, 0, objWidth, objHeight], {
            strokeWidth: lineWidth,
            stroke: "#000000"
        }), new fabric.Line([0, objHeight, objWidth, 0], {
            strokeWidth: lineWidth,
            stroke: "#000000"
        })
    ];
    let style2 = [
        new fabric.Rect({
            width: objWidth,
            height: objHeight,
            fill: "#FFFFFF",
            stroke: "#000000",
            strokeWidth: lineWidth,
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
            fill: "#EEEEEE"
        }),
        new fabric.Circle({
            radius: objHeight/9,
            left: objWidth/8,
            top: objHeight/7,
            fill: "#EEEEEE",
            strokeWidth: lineWidth,
            stroke: "#000000"
        })
    ]
    let theImage = new fabric.Group((style === 1 ? style1 : style2), {
        id: object.id,
        parentId: object.parentId,
        boardId: board.id,
        left: board.left + object.data.position.x,
        top: board.top + object.data.position.y
    })
    canvas.add(theImage);
    return ERRCODE.SUCCESS;
}
// type: RADIO
const drawRadio = function(board, object) {
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
        parentId: object.parentId,
        boardId: board.id,
        left: board.left + object.data.position.x,
        top: board.top + object.data.position.y,
    })
    canvas.add(theRadio);
    return ERRCODE.SUCCESS;
}
// type: RATING
const drawRating = function(board, object) {
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
                    parentId: object.parentId,
                    boardId: board.id,
                    left: board.left + object.data.position.x,
                    top: board.top + object.data.position.y,
                });
                canvas.add(theRating);
            });
        });
    });
    return ERRCODE.SUCCESS;
}
// type: SWITCH
const drawSwitch = function(board, object) {
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
        top: 2,
        left: (object.data.status === "ON" ? switchRadius*2-2 : 2)

    });
    let theSwitch = new fabric.Group([SwitchCover, SwitchKnob], {
        id: object.id,
        parentId: object.parentId,
        boardId: board.id,
        left: board.left + object.data.position.x,
        top: board.top + object.data.position.y,
    });
    canvas.add(theSwitch);
    return ERRCODE.SUCCESS;
}
// type: TEXT
const drawText = function(board, object) {
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
        parentId: object.parentId,
        boardId: board.id,
        left: board.left + object.data.position.x,
        top: board.top + object.data.position.y,
    });
    canvas.add(theText);
    return ERRCODE.SUCCESS;
}
// type: TEXTBOX/TEXTAREA
const drawInput = function(board, object) {
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
        }),
        new fabric.Textbox(object.data.text, {
            fontFamily: "Fira Sans, sans-serif",
            fontSize: textSize,
            width: inputBoxWidth - textSize,
            fill: object.data.enablePlaceholder ? "#333333" : "rgba(0,0,0,0)",
            scaleY: 1,
            borderColor: "#000000",
            left: textSize,
            top: textSize*0.75,
        })
    ], {
        top: verticalSpacing,
    });
    let theInput = new fabric.Group([inputLabel, inputBox], {
        id: object.id,
        parentId: object.parentId,
        boardId: board.id,
        left: board.left + object.data.position.x,
        top: board.top + object.data.position.y,
    });
    canvas.add(theInput);
    return ERRCODE.SUCCESS;
}
// type: ICON
const drawIcon = function(board, object) {

}

/* For development */
const drawDebugLine = function(boardId, objectId) {
    let board = canvas.getObjects().find((obj) => {
        return obj.id === boardId;
    });
    let debugObject = canvas.getObjects().find((obj) => {
        return obj.id === objectId;
    });
    let debugPosX = debugObject.left;
    let debugPosY = debugObject.top;
    let theDebugLine = new fabric.Line([board.left, board.top, debugPosX, debugPosY], {
        strokeWidth: 1,
        stroke: "#FF0000",
    });
    return ERRCODE.SUCCESS;
}