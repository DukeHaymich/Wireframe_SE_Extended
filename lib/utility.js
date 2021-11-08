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