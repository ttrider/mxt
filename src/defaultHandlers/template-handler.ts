import { HandlerContext, TemplateInfo, AttributeTokenInfo } from "../index";
import { Element } from "domhandler";
import { ElementType } from "domelementtype";
import { ComponentFile } from "../component-file";
import { parseInlineExpressions } from "../ast/ts";
import getElementInfo from "../dom/elementInfo";

let idindex = 1;
let partid = 1;

//<mxt.component name="if01" from="./if01" with="${inner2}" />
//<mxt.import name="if03" from="./if03" as="f0000" />
//<mxt.with data="${inner}">
//<mxt.if></mxt.if>
//<mxt.foreach data="${items}"></mxt.foreach data="${items}"> 
//<mxt.switch on="${switchindex}"><mxt.case when="${0}"></mxt.case><mxt.default></mxt.default></mxt.switch>

export function processTemplate(componentFile: ComponentFile, templateId: string) {

    const templateElement = componentFile.templates[templateId];
    const component_id = templateElement.attribs.id;

    const template: TemplateInfo = {
        id: `p${partid++}`,
        name: "template",
        attributes: templateElement.attribs,
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
    for (const item of templateElement.children) {
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


function processElementSet(elements: Element[]) {

    for (const el of elements) {

        switch (el.type.toLowerCase()) {
            // ???
            case ElementType.CDATA: break;
            // include as-is
            case ElementType.Comment: break;
            // include as-is
            case ElementType.Directive: break;
            // ignore
            case ElementType.Doctype: break;
            // extract into a top level script 
            case ElementType.Script: break;
            // extract and process the style element in the context of the component
            case ElementType.Style: break;
            // normal elements    
            case ElementType.Tag:
<<<<<<< HEAD
                // if the element is an <mxt.> element, 
                // we need to convert the whole set
                break;
            // text block
            case ElementType.Text: 
                // text blocks 
                // if we have any <mxt> elements or tokens, we would need to convert it into <span>
            break;
=======
                break;
            // text block
            case ElementType.Text: break;
>>>>>>> ffa6400eeba6ea6b518cec3a44fea7b07b1ad07c
        }




    }





}



export default processTemplate;
