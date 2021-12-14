export function JSONTextParser(item) {
    item = (typeof item !== "string"
        ? JSON.stringify(item)
        : item
    );
    try {
        item = JSON.parse(item);
    } catch (e) {
        return null;
    }
    if (typeof item === "object" && item !== null) {
        return item;
    }
    return null;
}

function NotifyText(title, content) {
    let p = document.createElement("p");
    let sp = document.createElement("span");
    sp.appendChild(document.createTextNode(title));
    p.appendChild(sp);
    p.appendChild(document.createTextNode(" " + content));
    return p;
}

/* Notify successful or fail execution */
const notiDiv = document.querySelector(".notification");
var timerID;
export const notify = function(title, content, type, milisec) {
    content = NotifyText(title, content);
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

export function JSONFileParser(path, callback) {
    fetch(path).then(
        res => res.json()
    ).then(
        data => callback(data)
    );
}