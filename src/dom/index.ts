import { Element } from "domhandler";
const du = require("DomUtils");
const { getOuterHTML } = du;



export function getHTML(elements: Element | Element[]) {

    return getOuterHTML(elements, { decodeEntities: true, xmlMode: true });
}