import { HandlerContext, TemplateInfo, AttributeTokenInfo } from "../index";
import { Element } from "domhandler";
import { ElementType } from "domelementtype";
import { ComponentFile } from "../component-file";
import { parseInlineExpressions } from "../ast/ts";
import getElementInfo from "../dom/elementInfo";

let idindex = 1;
let partid = 1;


export function parseTemplate(componentFile: ComponentFile, element: Element) {
    if (element.name.toLowerCase() !== "template") {
        return false;
    }
    if (element.attribs["type"] !== "mxt") {
        return false;
    }
    const component_id = element.attribs.id;
    if (!component_id) {
        componentFile.errors.push(new Error(`template doesn't have an id`))
        return false;
    }

    if (componentFile.components[component_id]) {
        componentFile.errors.push(new Error(`duplicate template id`))
        return false;
    }

    const template: TemplateInfo = {
        id: `p${partid++}`,
        name: "template",
        attributes: element.attribs,
        elements: [],
        dynamicElements: {}
    };



    componentFile.components[component_id] = {
        id: component_id,
        rootPart: template.id,
        parts: {
            [template.id]: template
        }
    }

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


        

    }

    function processTag(template: TemplateInfo, tagItem: Element) {

        const elementInfo = getElementInfo(tagItem.name);

        const tokenizedAttributes: string[] = [];

        for (const attrName in tagItem.attribs) {
            if (tagItem.attribs.hasOwnProperty(attrName)) {

                const attrValue = tagItem.attribs[attrName];
                const attrState = parseInlineExpressions(attrValue) as AttributeTokenInfo;

                // detect event handlers first

                if (processMxtAttribute(attrName, attrValue, attrState)) {
                    continue;
                }

                // detect and process tokens in attributes
                if (attrValue) {
                    processAttributeTokens(attrName, attrValue, attrState);
                }

            }
        }
        for (const tokenizedAttribute of tokenizedAttributes) {
            delete tagItem.attribs[tokenizedAttribute];
        }

        for (const item of tagItem.children) {
            processItem(template, item as Element);
        }

        function processMxtAttribute(attrName: string, attrValue: string, attrState: AttributeTokenInfo) {

            if (!attrName.startsWith("mxt.")) {
                return false;
            }
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
                processMxtEvent(mxtParts);
            }




            function processMxtEvent(mxtParts: string[]) {

                const name = mxtParts[1];

                const de = getDynamicElement(tagItem);

                let ev = de.events[name];
                if (!ev) {
                    ev = de.events[name] = { name }
                };

                if (mxtParts.length === 3) {

                    const trueValue = attrValue === undefined || attrValue === "" || attrValue.toLowerCase() === "true";

                    switch (mxtParts[2].toLowerCase() ?? "") {
                        case "preventdefault":
                            ev.preventDefault = trueValue;
                            tokenizedAttributes.push(attrName);
                            break;
                        case "stoppropagation":
                            ev.stopPropagation = trueValue;
                            tokenizedAttributes.push(attrName);
                            break;
                        case "stopimmediatepropagation":
                            ev.stopImmediatePropagation = trueValue;
                            tokenizedAttributes.push(attrName);
                            break;
                        case "capture":
                            ev.capture = trueValue;
                            tokenizedAttributes.push(attrName);
                            break;
                        case "once":
                            ev.once = trueValue;
                            tokenizedAttributes.push(attrName);
                            break;
                        case "passive":
                            ev.passive = trueValue;
                            tokenizedAttributes.push(attrName);
                            break;
                    }
                } else {

                    // event name can come in multiple forms:
                    // "name"
                    // "${name}"
                    // "${(e)=>{ some code here}"
                    // this is not allowed:
                    // "sometext${token}someother text"

                    if (attrState.hasTokens && attrState.externalReferences.length > 0) {
                        // TODO: we need a lot of error checking here
                        ev.handler = attrState.externalReferences[0];
                    } else {
                        ev.handler = attrValue;
                    }

                    tokenizedAttributes.push(attrName);
                }
            }
        }

        function processAttributeTokens(attrName: string, attrValue: string, attrState: AttributeTokenInfo) {
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
