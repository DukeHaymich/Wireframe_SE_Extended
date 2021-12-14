import * as UTIL from './lib/utility.js';
import * as CANVAS from './lib/canvas_init.js';
import * as WIREFRAME from './lib/wireframe.js';

/*** Work with JSON ***/
/* Import into canvas */
const JSONtextarea = document.getElementById("json");
document.getElementById("importBtn").addEventListener("click", () => {
    let objectList = UTIL.JSONTextParser(JSONtextarea.value);
    if (objectList === null) {
        UTIL.notify(
            "Error:",
            "The text you entered is not JSON type!",
            "fail",
            5000
        );
    } else {
        objectList = WIREFRAME.objectInputParser(...objectList);
        var boardID = objectList.length ? objectList[0].boardId : WIREFRAME.newObject.id++;
        switch (WIREFRAME.renderCanvas(boardID, objectList)) {
            case WIREFRAME.ERRCODE.SUCCESS:
                UTIL.notify(
                    "Success!",
                    "The canvas is now displaying imported content.",
                    "success",
                    5000
                );
                break;
            case WIREFRAME.ERRCODE.ZERO_SIZE:
                UTIL.notify(
                    "Warning:",
                    "The sizes of some objects are zero! These ones are not rendered.",
                    "fail",
                    5000
                );
                break;
            case WIREFRAME.ERRCODE.UNSUPPORTED:
                UTIL.notify(
                    "Warning:",
                    "Some of components imported are unsupported and not rendered to canvas!",
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
    UTIL.notify(
        "Success!",
        "The JSON is copied to your clipboard!",
        "success",
        5000
    );
});

/* Component library */
var boardId = 1;
document.getElementById("add-avatar").addEventListener("click", function() {
    UTIL.JSONFileParser("/lib/components/avatar.json", (object) => {
        object.id = WIREFRAME.newObject.id++;
        object.parentId = -1;
        object.boardId = boardId;
        object.childrenId = [];
        object.data.position = {
            "x": WIREFRAME.newObject.avatar * 20,
            "y": WIREFRAME.newObject.avatar * 10
        };
        WIREFRAME.newObject.avatar++;
        var board = WIREFRAME.getBoard(boardId);
        WIREFRAME.drawAvatar(board, object);
        CANVAS.updateModifications();
        UTIL.notify(
            "Success!",
            "Added component to board 1!",
            "success",
            5000
        );
    });
});
document.getElementById("add-bodytext").addEventListener("click", function() {
    UTIL.JSONFileParser("/lib/components/bodytext.json", (object) => {
        object.id = WIREFRAME.newObject.id++;
        object.parentId = -1;
        object.boardId = boardId;
        object.childrenId = [];
        object.data.position = {
            "x": WIREFRAME.newObject.text * 20,
            "y": WIREFRAME.newObject.text * 10
        };
        WIREFRAME.newObject.text++;
        var board = WIREFRAME.getBoard(boardId);
        WIREFRAME.drawText(board, object);
        CANVAS.updateModifications();
        UTIL.notify(
            "Success!",
            "Added component to board 1!",
            "success",
            5000
        );
    });
});
document.getElementById("add-button").addEventListener("click", function() {
    UTIL.JSONFileParser("/lib/components/button.json", (object) => {
        object.id = WIREFRAME.newObject.id++;
        object.parentId = -1;
        object.boardId = boardId;
        object.childrenId = [];
        object.data.position = {
            "x": WIREFRAME.newObject.button * 20,
            "y": WIREFRAME.newObject.button * 10
        };
        WIREFRAME.newObject.button++;
        var board = WIREFRAME.getBoard(boardId);
        WIREFRAME.drawButton(board, object);
        CANVAS.updateModifications();
        UTIL.notify(
            "Success!",
            "Added component to board 1!",
            "success",
            5000
        );
    });
});
document.getElementById("add-chart").addEventListener("click", function() {
    UTIL.JSONFileParser("/lib/components/chart.json", (object) => {
        object.id = WIREFRAME.newObject.id++;
        object.parentId = -1;
        object.boardId = boardId;
        object.childrenId = [];
        object.data.position = {
            "x": WIREFRAME.newObject.chart * 20,
            "y": WIREFRAME.newObject.chart * 10
        };
        WIREFRAME.newObject.chart++;
        var board = WIREFRAME.getBoard(boardId);
        WIREFRAME.drawChart(board, object);
        CANVAS.updateModifications();
        UTIL.notify(
            "Success!",
            "Added component to board 1!",
            "success",
            5000
        );
    });
});
document.getElementById("add-checkbox").addEventListener("click", function() {
    UTIL.JSONFileParser("/lib/components/checkbox.json", (object) => {
        object.id = WIREFRAME.newObject.id++;
        object.parentId = -1;
        object.boardId = boardId;
        object.data.position = {
            "x": WIREFRAME.newObject.checkbox * 20,
            "y": WIREFRAME.newObject.checkbox * 10
        };
        for (let i = 0; i < object.children.length; ++i) {
            object.children[i].id = WIREFRAME.newObject.id++;
            object.children[i].parentId = object.id;
            object.children[i].boardId = object.boardId;
            object.children[i].childrenId = [];
        }
        WIREFRAME.newObject.checkbox++;
        var board = WIREFRAME.getBoard(boardId);
        WIREFRAME.drawCheckbox(board, object);
        CANVAS.updateModifications();
        UTIL.notify(
            "Success!",
            "Added component to board 1!",
            "success",
            5000
        );
    });
});
document.getElementById("add-divider").addEventListener("click", function() {
    UTIL.JSONFileParser("/lib/components/divider.json", (object) => {
        object.id = WIREFRAME.newObject.id++;
        object.parentId = -1;
        object.boardId = boardId;
        object.childrenId = [];
        object.data.position = {
            "x": 10 + WIREFRAME.newObject.divider * 20,
            "y": 10 + WIREFRAME.newObject.divider * 10
        };
        WIREFRAME.newObject.divider++;
        var board = WIREFRAME.getBoard(boardId);
        WIREFRAME.drawDivider(board, object);
        CANVAS.updateModifications();
        UTIL.notify(
            "Success!",
            "Added component to board 1!",
            "success",
            5000
        );
    });
});
document.getElementById("add-heading").addEventListener("click", function() {
    UTIL.JSONFileParser("/lib/components/heading.json", (object) => {
        object.id = WIREFRAME.newObject.id++;
        object.parentId = -1;
        object.boardId = boardId;
        object.childrenId = [];
        object.data.position = {
            "x": WIREFRAME.newObject.text * 20,
            "y": WIREFRAME.newObject.text * 10
        };
        WIREFRAME.newObject.text++;
        var board = WIREFRAME.getBoard(boardId);
        WIREFRAME.drawText(board, object);
        CANVAS.updateModifications();
        UTIL.notify(
            "Success!",
            "Added component to board 1!",
            "success",
            5000
        );
    });
});
document.getElementById("add-image").addEventListener("click", function() {
    UTIL.JSONFileParser("/lib/components/image.json", (object) => {
        object.id = WIREFRAME.newObject.id++;
        object.parentId = -1;
        object.boardId = boardId;
        object.childrenId = [];
        object.data.position = {
            "x": WIREFRAME.newObject.image * 20,
            "y": WIREFRAME.newObject.image * 10
        };
        WIREFRAME.newObject.image++;
        var board = WIREFRAME.getBoard(boardId);
        WIREFRAME.drawImage(board, object);
        CANVAS.updateModifications();
        UTIL.notify(
            "Success!",
            "Added component to board 1!",
            "success",
            5000
        );
    });
});
document.getElementById("add-link").addEventListener("click", function() {
    UTIL.JSONFileParser("/lib/components/link.json", (object) => {
        object.id = WIREFRAME.newObject.id++;
        object.parentId = -1;
        object.boardId = boardId;
        object.childrenId = [];
        object.data.position = {
            "x": WIREFRAME.newObject.text * 20,
            "y": WIREFRAME.newObject.text * 10
        };
        WIREFRAME.newObject.text++;
        var board = WIREFRAME.getBoard(boardId);
        WIREFRAME.drawText(board, object);
        CANVAS.updateModifications();
        UTIL.notify(
            "Success!",
            "Added component to board 1!",
            "success",
            5000
        );
    });
});
document.getElementById("add-radio").addEventListener("click", function() {
    UTIL.JSONFileParser("/lib/components/radio.json", (object) => {
        object.id = WIREFRAME.newObject.id++;
        object.parentId = -1;
        object.boardId = boardId;
        object.data.position = {
            "x": WIREFRAME.newObject.radio * 20,
            "y": WIREFRAME.newObject.radio * 10
        };
        for (let i = 0; i < object.children.length; ++i) {
            object.children[i].id = WIREFRAME.newObject.id++;
            object.children[i].parentId = object.id;
            object.children[i].boardId = object.boardId;
            object.children[i].childrenId = [];
        }
        WIREFRAME.newObject.radio++;
        var board = WIREFRAME.getBoard(boardId);
        WIREFRAME.drawRadio(board, object);
        CANVAS.updateModifications();
        UTIL.notify(
            "Success!",
            "Added component to board 1!",
            "success",
            5000
        );
    });
});
document.getElementById("add-rating").addEventListener("click", function() {
    UTIL.JSONFileParser("/lib/components/rating.json", (object) => {
        object.id = WIREFRAME.newObject.id++;
        object.parentId = -1;
        object.boardId = boardId;
        object.childrenId = [];
        object.data.position = {
            "x": WIREFRAME.newObject.rating * 20,
            "y": WIREFRAME.newObject.rating * 10
        };
        WIREFRAME.newObject.rating++;
        var board = WIREFRAME.getBoard(boardId);
        WIREFRAME.drawRating(board, object);
        CANVAS.updateModifications();
        UTIL.notify(
            "Success!",
            "Added component to board 1!",
            "success",
            5000
        );
    });
});
document.getElementById("add-rectangle").addEventListener("click", function() {
    UTIL.JSONFileParser("/lib/components/rectangle.json", (object) => {
        object.id = WIREFRAME.newObject.id++;
        object.parentId = -1;
        object.boardId = boardId;
        object.childrenId = [];
        object.data.position = {
            "x": WIREFRAME.newObject.container * 20,
            "y": WIREFRAME.newObject.container * 10
        };
        WIREFRAME.newObject.container++;
        var board = WIREFRAME.getBoard(boardId);
        WIREFRAME.drawContainer(board, object);
        CANVAS.updateModifications();
        UTIL.notify(
            "Success!",
            "Added component to board 1!",
            "success",
            5000
        );
    });
});
document.getElementById("add-switch").addEventListener("click", function() {
    UTIL.JSONFileParser("/lib/components/switch.json", (object) => {
        object.id = WIREFRAME.newObject.id++;
        object.parentId = -1;
        object.boardId = boardId;
        object.childrenId = [];
        object.data.position = {
            "x": WIREFRAME.newObject.switch * 20,
            "y": WIREFRAME.newObject.switch * 10
        };
        WIREFRAME.newObject.switch++;
        var board = WIREFRAME.getBoard(boardId);
        WIREFRAME.drawSwitch(board, object);
        CANVAS.updateModifications();
        UTIL.notify(
            "Success!",
            "Added component to board 1!",
            "success",
            5000
        );
    });
});
document.getElementById("add-textarea").addEventListener("click", function() {
    UTIL.JSONFileParser("/lib/components/textarea.json", (object) => {
        object.id = WIREFRAME.newObject.id++;
        object.parentId = -1;
        object.boardId = boardId;
        object.childrenId = [];
        object.data.position = {
            "x": WIREFRAME.newObject.textarea * 20,
            "y": WIREFRAME.newObject.textarea * 10
        };
        WIREFRAME.newObject.textarea++;
        var board = WIREFRAME.getBoard(boardId);
        WIREFRAME.drawInput(board, object);
        CANVAS.updateModifications();
        UTIL.notify(
            "Success!",
            "Added component to board 1!",
            "success",
            5000
        );
    });
});
document.getElementById("add-textbox").addEventListener("click", function() {
    UTIL.JSONFileParser("/lib/components/textbox.json", (object) => {
        object.id = WIREFRAME.newObject.id++;
        object.parentId = -1;
        object.boardId = boardId;
        object.childrenId = [];
        object.data.position = {
            "x": WIREFRAME.newObject.textbox * 20,
            "y": WIREFRAME.newObject.textbox * 10
        };
        WIREFRAME.newObject.textbox++;
        var board = WIREFRAME.getBoard(boardId);
        WIREFRAME.drawInput(board, object);
        CANVAS.updateModifications();
        UTIL.notify(
            "Success!",
            "Added component to board 1!",
            "success",
            5000
        );
    });
});