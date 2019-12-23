"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const ts_1 = require("../ast/ts");
let idindex = 1;
function parseTemplate(context, componentFile, element) {
    if (element.name.toLowerCase() !== "template") {
        return false;
    }
    if (element.attribs["type"] !== "mxt") {
        return false;
    }
    const template_id = element.attribs.id;
    if (!template_id) {
        componentFile.errors.push(new Error(`template doesn't have an id`));
        return false;
    }
    if (componentFile.templates[template_id]) {
        componentFile.errors.push(new Error(`duplicate template id`));
        return false;
    }
    const template = {
        id: element.attribs.id,
        name: "template",
        attributes: element.attribs,
        elements: [],
        tokens: []
    };
    componentFile.templates[template_id] = template;
    // traverse template
    for (const item of element.children) {
        const element = item;
        template.elements.push(element);
        processItem(template, element);
    }
    function processItem(template, item) {
        switch (item.type.toLowerCase()) {
            case "cdata" /* CDATA */: break;
            case "comment" /* Comment */: break;
            case "directive" /* Directive */: break;
            case "doctype" /* Doctype */: break;
            case "script" /* Script */: break;
            case "style" /* Style */: break;
            case "tag" /* Tag */:
                processTag(template, item);
                break;
            case "text" /* Text */: break;
        }
        //const name = item.name.toLowerCase();
        // if (name === "template") {
        //     // extract sub-template
        //     //pre parse
        //     // parse
        //     // post parse
        //     parseTemplate(context, componentFile, item);
        //     if (item.parent) {
        //         const indexOf = item.parent.children.indexOf(item);
        //         if (indexOf !== -1) {
        //             item.parent.children.splice(indexOf, 1);
        //         }
        //     }
        //     return;
        // }
    }
    function processTag(template, tagItem) {
        const tokenizedAttributes = [];
        for (const attrName in tagItem.attribs) {
            if (tagItem.attribs.hasOwnProperty(attrName)) {
                const attrValue = tagItem.attribs[attrName];
                if (attrValue) {
                    const attrState = ts_1.parseInlineExpressions(attrValue);
                    if (attrState.hasTokens) {
                        if (tagItem.attribs.id$$original === undefined) {
                            tagItem.attribs.id$$original = tagItem.attribs.id === undefined ? "" : tagItem.attribs.id;
                            tagItem.attribs.id = `tagid_${idindex++}`;
                        }
                        attrState.attributeName = attrName;
                        attrState.elementId = tagItem.attribs.id;
                        attrState.elementIdOriginal = tagItem.attribs.id$$original;
                        template.tokens.push(attrState);
                        tokenizedAttributes.push(attrName);
                    }
                }
            }
        }
        for (const tokenizedAttribute of tokenizedAttributes) {
            delete tagItem.attribs[tokenizedAttribute];
        }
        delete tagItem.attribs.id$$original;
        for (const item of tagItem.children) {
            processItem(template, item);
        }
    }
    return true;
}
exports.parseTemplate = parseTemplate;
//# sourceMappingURL=template-handler.js.map