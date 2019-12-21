"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const index_1 = require("../index");
function parseStyle(context, componentFile, element) {
    if (element.name.toLowerCase() === "link") {
        return parseLink(context, componentFile, element);
    }
    if (element.name.toLowerCase() !== "style") {
        return false;
    }
    const styleElement = {
        name: "style",
        attributes: element.attribs,
        rules: []
    };
    if (element.firstChild) {
        styleElement.content = element.firstChild.data;
        styleElement.expressions = index_1.extractExpressions(styleElement.content);
    }
    componentFile.globalStyles.push(styleElement);
    return true;
}
exports.parseStyle = parseStyle;
function parseLink(context, componentFile, element) {
    const linkElement = {
        name: "link",
        attributes: element.attribs,
    };
    componentFile.links.push(linkElement);
    return true;
}
//# sourceMappingURL=style-handler.js.map