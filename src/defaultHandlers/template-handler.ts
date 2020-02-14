import { HandlerContext, TemplateInfo, AttributeTokenInfo, ComponentInfo, TokenInfo, ExpressionInfo } from "../index";
import { Element, DataNode } from "domhandler";
import { ElementType } from "domelementtype";
import { ComponentFile } from "../component-file";
import { parseInlineExpressions, tokenizedContent } from "../ast/ts";
import getElementInfo from "../dom/elementInfo";
import * as du from "domutils";
import { removeElement } from "domutils";
//import { DomElement } from "domhandler";
import processStyle from "./style-handler";
import { Problem, ProblemCode } from "../problem";

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

                    if (attrState.tokens && attrState.externalReferences.length > 0) {
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
            if (attrState.tokens) {

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


async function processElementSet(componentFile: ComponentFile, component: ComponentInfo, elements: Element[]) {

    const textNodes: Element[] = [];
    let hasMxtNode: boolean = false;


    for (const el of elements) {
        const elType = el.type.toLowerCase();

        switch (elType) {

            // include as-is
            case ElementType.Comment:
            case ElementType.Directive:
                break;
            // ignore
            case ElementType.Doctype:
                removeElement(el);
                break;
            // extract into a top level script 
            case ElementType.Script:
                componentFile.scripts.push(el);
                removeElement(el);
                break;
            case ElementType.Style:
                await processStyleElement(el);
                removeElement(el);
                break;
            // normal elements    
            case ElementType.Tag:
                processTagElement(el);
                break;
            // text block
            case ElementType.CDATA:
            case ElementType.Text:
                // text blocks 
                // if we have any <mxt> elements or tokens, we would need to convert it into <span>
                textNodes.push(el);
                break;
        }

    }

    async function processStyleElement(element: Element) {

        const content = (element.firstChild as DataNode)?.data;
        if (content) {
            const type = element.attribs.type ?? "text/css";
            const isGlobal = element.attribs["mxt.global"];

            const { globalStyle, componentStyle, dynamicStyle } = await processStyle(content, type, isGlobal === "true");

            if (globalStyle) {
                (componentFile.styles = componentFile.styles ?? []).push(globalStyle);
            }
            else if (componentStyle) {
                (component.styles = component.styles ?? []).push(componentStyle);
            }
            else if (dynamicStyle) {
                (component.dynamicStyles = component.dynamicStyles ?? []).push(dynamicStyle);
            }
        }
    }

    function processTagElement(element: Element) {

        const name = element.name.toLowerCase();
        if (name.startsWith("mxt.")) {

            switch (name.substring(4)) {
                case "component":
                    processMxtComponent(element);
                    break;
                case "foreach":
                    processMxtForeach(element);
                    break;
                case "if":
                    processMxtIf(element);
                    break;
                case "import":
                    processMxtImport(componentFile, element);
                    break;
                case "switch":
                    processMxtSwitch(element);
                    break;
                case "with":
                    processMxtWith(element);
                    break;
                default:
                    componentFile.problemFromElement(ProblemCode.ERR003, element);
                    break;
            }
        }




    }

    function processMxtComponent(element: Element) {

    }
    function processMxtForeach(element: Element) {

    }
    function processMxtIf(element: Element) {

    }

    function processMxtSwitch(element: Element) {

    }
    function processMxtWith(element: Element) {

    }

}


export function processMxtImport(componentFile: ComponentFile, element: Element) {
    //<mxt.import from="./if03" as="foo"/>              -> import foo from "./if03
    //<mxt.import from="./if03" name="foo"/>            -> import {foo} from "./if03
    //<mxt.import from="./if03" name="foo" as="bar"/>   -> import {foo as bar} from "./if03
    const attrs = element.attribs;

    if (!attrs.from) {
        componentFile.problemFromElement(ProblemCode.ERR004, element);
        return;
    }

    if (!attrs.as) {
        if (!attrs.name) {
            componentFile.problemFromElement(ProblemCode.ERR005, element);
            return;
        }
        componentFile.imports.add({ name: attrs.name, as: attrs.name }, attrs.from);
        return;
    } else {
        if (!attrs.name) {
            componentFile.imports.add(attrs.as, attrs.from);
            return;
        }
        componentFile.imports.add({ name: attrs.name, as: attrs.as }, attrs.from);
        return;
    }
}


export default processTemplate;
