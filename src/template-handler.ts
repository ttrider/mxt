import { HandlerContext, ElementInfo, extractExpressions, StyleElementInfo, TemplateInfo, parseExpressions, AttributeTokenInfo } from "./index";
import { Element, DataNode } from "domhandler";
import { isTag, ElementType } from "domelementtype";
import { ComponentFile } from "./core";

let idindex = 1;


export function parseTemplate(context: HandlerContext, componentFile: ComponentFile, element: Element) {
    if (element.name.toLowerCase() !== "template") {
        return false;
    }
    if (element.attribs["type"] !== "mxt") {
        return false;
    }
    const template_id = element.attribs.id;
    if (!template_id) {
        componentFile.errors.push(new Error(`template doesn't have an id`))
        return false;
    }

    if (componentFile.templates[template_id]) {
        componentFile.errors.push(new Error(`duplicate template id`))
        return false;
    }

    const template: TemplateInfo = {
        id: element.attribs.id,
        name: "template",
        attributes: element.attribs,
        elements: [],
        tokens: []
    };

    componentFile.templates[template_id] = template;

    // traverse template
    for (const item of element.children) {
        const element = item as Element;
        template.elements.push(element);
        processItem(template, element);
    }

    function processItem(template: TemplateInfo, item: Element) {

        switch (item.type.toLowerCase()) {
            case ElementType.CDATA: break;
            case ElementType.Comment: break;
            case ElementType.Directive: break;
            case ElementType.Doctype: break;
            case ElementType.Script: break;
            case ElementType.Style: break;
            case ElementType.Tag:
                processTag(template, item);
                break;
            case ElementType.Text: break;
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

    function processTag(template: TemplateInfo, tagItem: Element) {

        const tokenizedAttributes: string[] = [];
        for (const attrName in tagItem.attribs) {
            if (tagItem.attribs.hasOwnProperty(attrName)) {

                const attrValue = tagItem.attribs[attrName];

                if (attrValue) {
                    const attrState = parseExpressions(attrValue) as AttributeTokenInfo;
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
            processItem(template, item as Element);
        }
    }

    return true;
}
