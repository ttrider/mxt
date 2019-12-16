import { HandlerContext, ComponentFileInfo, ElementInfo, extractExpressions, StyleElementInfo, TemplateInfo } from "./index";
import { Element, DataNode } from "domhandler";
import { isTag, ElementType } from "domelementtype";

let idindex = 1;


export function parseTemplate(context: HandlerContext, componentFile: ComponentFileInfo, element: Element) {
    if (element.name.toLowerCase() !== "template") {
        return false;
    }
    if (element.attribs["type"] !== "mxt") {
        return false;
    }

    const template: TemplateInfo = {
        name: "template",
        attributes: element.attribs,
        tokens: []
    };

    // traverse template
    for (const item of element.children) {
        processItem(template, item as Element);

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

        // check attributes for tokens
        for (const attrName in tagItem.attribs) {
            if (tagItem.attribs.hasOwnProperty(attrName)) {

                const attrValue = tagItem.attribs[attrName];

                const hasToken = /(^|[^\\])\${.*}/gm.test(attrValue);

                if (hasToken) {
                    if (!tagItem.attribs.id) {
                        tagItem.attribs.id = `tagid_${idindex++}`;
                    }

                    template.tokens.push({
                        tagId: tagItem.attribs.id,
                        attrName,
                        attrValue
                    });

                }
            }
        }

        for (const item of tagItem.children) {
            processItem(template, item as Element);

        }
    }


    return true;
}
