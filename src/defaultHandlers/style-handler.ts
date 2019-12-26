import { HandlerContext, ElementInfo, extractExpressions, StyleElementInfo } from "../index";
import {  Element, DataNode } from "domhandler";
import { ComponentFile } from "../component-file";


export function parseStyle(context: HandlerContext, componentFile: ComponentFile, element: Element) {
    if (element.name.toLowerCase() === "link") {
        return parseLink(context, componentFile, element);
    }
    if (element.name.toLowerCase() !== "style") {
        return false;
    }

    const styleElement: StyleElementInfo = {
        name: "style",
        attributes: element.attribs,
        rules:[]
    };

    if (element.firstChild) {
        styleElement.content = (element.firstChild as DataNode).data;
        styleElement.expressions = extractExpressions(styleElement.content);
    }

    componentFile.globalStyles.push(styleElement);

    return true;
}

function parseLink(context: HandlerContext, componentFile: ComponentFile, element: Element) {

    const linkElement: ElementInfo = {
        name: "link",
        attributes: element.attribs,
    };

    componentFile.links.push(linkElement);
    return true;
}
