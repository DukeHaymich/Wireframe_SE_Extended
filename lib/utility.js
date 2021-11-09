export function JSONParser(item) {
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

export function NotifyText(title, content) {
    let p = document.createElement("p");
    let sp = document.createElement("span");
    sp.appendChild(document.createTextNode(title));
    p.appendChild(sp);
    p.appendChild(document.createTextNode(" " + content));
    return p;
}