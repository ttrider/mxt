import { HandlerContext, TemplateInfo, AttributeTokenInfo } from "../index";
import { Element } from "domhandler";
import { ElementType } from "domelementtype";
import { ComponentFile } from "../component-file";
import { parseInlineExpressions } from "../ast/ts";
import getElementInfo from "../dom/elementInfo";

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
        dynamicElements: {}
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

        const elementInfo = getElementInfo(tagItem.name);

        const tokenizedAttributes: string[] = [];

        for (const attrName in tagItem.attribs) {
            if (tagItem.attribs.hasOwnProperty(attrName)) {

                const attrValue = tagItem.attribs[attrName];

                // detect and process tokens in attributes
                if (attrValue) {
                    processAttributeTokens(attrName, attrValue);
                }

                // detect event handlers
                if (attrName.startsWith("mxt.")) {
                    processMxtAttribute(attrName, attrValue);
                }


            }
        }
        for (const tokenizedAttribute of tokenizedAttributes) {
            delete tagItem.attribs[tokenizedAttribute];
        }

        for (const item of tagItem.children) {
            processItem(template, item as Element);
        }

        function processMxtAttribute(attrName: string, attrValue: string) {

            // Events
            // mxt.<event>
            // mxt.<event>.preventDefault 
            // mxt.<event>.stopPropagation 
            // mxt.<event>.stopImmediatePropagation

            const mxtParts = attrName.split(".");
            if (mxtParts[0] !== "mxt" || mxtParts.length < 2) {
                return;
            }

            const eventInfo = elementInfo?.events[mxtParts[1]];
            if (eventInfo) {
                // we have an event!
                const name = mxtParts[1];

                const de = getDynamicElement(tagItem);

                let ev = de.events[name];
                if (!ev) {
                    ev = de.events[name] = {
                        name,
                    }
                };

                if (mxtParts.length === 3) {

                    const trueValue = attrValue === undefined || attrValue === "" || attrValue.toLowerCase() === "true";

                    switch (mxtParts[2]) {
                        case "preventDefault":
                            ev.preventDefault = trueValue;
                            break;
                        case "stopPropagation":
                            ev.stopPropagation = trueValue;
                            break;
                        case "stopImmediatePropagation":
                            ev.stopImmediatePropagation = trueValue;
                            break;
                    }
                } else {
                    ev.handler = attrValue;
                }
            }
        }


        function processAttributeTokens(attrName: string, attrValue: string) {
            const attrState = parseInlineExpressions(attrValue) as AttributeTokenInfo;
            if (attrState.hasTokens) {

                const el = getDynamicElement(tagItem);
                attrState.attributeName = attrName;
                el.attributes[attrName] = attrState;
                tokenizedAttributes.push(attrName);
            }
        }

        function getDynamicElement(tagItem: Element) {

            const tagId = tagItem.attribs.id ? tagItem.attribs.id : "";

            let item = template.dynamicElements[tagId];
            if (!item) {

                const originalId = tagId ? tagId : "";
                tagItem.attribs.id = `tagid_${idindex++}`;
                item = {
                    attributes: {},
                    events: {},
                    id: tagItem.attribs.id,
                    originalId,
                };
                template.dynamicElements[tagItem.attribs.id] = item;
            }
            return item;
        }
    }

    return true;
}
