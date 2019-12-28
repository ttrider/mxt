import { Element } from "domhandler";
import { getOuterHTML } from "DomUtils";



export function getHTML(elements: Element | Element[]) {

    return getOuterHTML(elements, { decodeEntities: true, xmlMode: true });
}