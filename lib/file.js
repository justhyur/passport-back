import fs from "fs";
import path from "path";

export function fileExists(filePath) {
    try {
        fs.accessSync(path.join(filePath), fs.constants.F_OK);
        return true;
    } catch (err) {
        return false;
    }
}

export function readJSON(filePath){
    const text = fs.readFileSync(path.join(filePath), 'utf-8');
    const obj = JSON.parse(text);
    return obj;
}

export function writeJSON(filePath, obj){
    const text = JSON.stringify(obj, null, 2);
    fs.writeFileSync(path.join(filePath), text);
}