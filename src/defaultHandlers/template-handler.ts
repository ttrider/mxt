import { TemplateInfo, AttributeTokenInfo, DynamicElementInfo } from "../index";
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
import { Component } from "../component";
import { SwitchSequence, PartReference, ForEachPart, EmptyPart, SwitchSequencePart, Part, WhenPartReference, ComponentRefPart, ComponentRef, ForEach, Template } from "../template_parts";

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

    const component = new Component(component_id);

    const template: TemplateInfo = {
        id: `p${partid++}`,
        name: "template",
        attributes: templateElement.attribs,
        elements: [],
        dynamicElements: {}
    };



    // componentFile.components[component_id] = {
    //     id: component_id,
    //     rootPart: template.id,
    //     parts: {
    //         [template.id]: template
    //     }
    // }

    // // traverse template
    // for (const item of templateElement.children) {
    //     const element = item as Element;
    //     template.elements.push(element);
    //     processItem(template, element);
    // }

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
                    embeddedParts: []
                };
                template.dynamicElements[tagItem.attribs.id] = item;
            }
            return item;
        }
    }

    return true;
}




async function processElementSet(componentFile: ComponentFile, component: Component, elements: Element[]) {

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
                    processMxtComponent(componentFile, component, element);
                    break;
                case "foreach":
                    processMxtForeach(componentFile, component, element);
                    break;
                case "if":
                    processMxtIf(componentFile, component, element);
                    break;
                case "import":
                    processMxtImport(componentFile, component, element);
                    break;
                case "switch":
                    processMxtSwitch(componentFile, component, element);
                    break;
                case "with":
                    processMxtWith(componentFile, component, element);
                    break;
                default:
                    componentFile.problemFromElement(ProblemCode.ERR003, element);
                    break;
            }
            removeElement(element);
        } else {

        }




    }

}


function wrapAsPart(componentFile: ComponentFile, component: Component, element: Element) {

    if (element.children.length === 0) {
        return;
    }

    const elements = element.children as Element[];

    processElements(elements);

    const dynamicElements: { [name: string]: DynamicElementInfo } = {};

    const part = component.newPart<Template>({
        elements: elements,
        attachTo: Object.values(dynamicElements)
    });

    const partRef: PartReference = {
        partId: part.id
    };
    if (element.attribs.with) {
        partRef.dc = parseInlineExpressions(element.attribs.with);
    }

    return partRef;


    function processElements(elements: Element[]) {

        for (const el of elements) {
            const elType = el.type.toLowerCase();
            switch (elType) {
                case ElementType.Tag:
                    const name = element.name.toLowerCase();
                    if (name.startsWith("mxt.")) {
                        const partRef = processMxtElement(el, name.substring(4));
                        if (partRef) {
                            // convert element into <SPAN>
                            el.name = "span";
                            el.tagName = "span";
                            el.attribs = {};
                            el.children = [];
                            //<TODO> how to cleanup the value?
                            //el.value
                            const de = getDynamicElement(el);
                            de.embeddedParts.push(partRef);
                        }
                    } else {
                        processHtmlTag(el);
                    }
                    break;
                case ElementType.CDATA:
                case ElementType.Text:
                    //TODO: process dynamic values in Text and CDATA(?)
                    break;
            }
        }

        function processHtmlTag(element: Element) {

            processTagAttributes(element);

            if (element.children.length > 0) {
                processElements(element.children as Element[]);
            }
        }

        function processTagAttributes(element: Element) {
            const tokenizedAttributes: string[] = [];

            for (const attrName in element.attribs) {
                if (element.attribs.hasOwnProperty(attrName)) {

                    const attrValue = element.attribs[attrName];
                    const attrState = parseInlineExpressions(attrValue) as AttributeTokenInfo;

                    // detect event handlers first

                    if (attrName.startsWith("mxt.")) {

                        // Events
                        // mxt.<event>
                        // mxt.<event>.preventDefault 
                        // mxt.<event>.stopPropagation 
                        // mxt.<event>.stopImmediatePropagation

                        const mxtParts = attrName.split(".");
                        if (mxtParts[0] === "mxt" || mxtParts.length > 1) {
                            processMxtEvent(mxtParts, attrName, attrValue, attrState);
                            continue;
                        }
                    }

                    // detect and process tokens in attributes
                    if (attrValue) {
                        if (attrState.tokens) {

                            const el = getDynamicElement(element);
                            attrState.attributeName = attrName;
                            el.attributes[attrName] = attrState;
                            tokenizedAttributes.push(attrName);
                        }
                    }

                }
            }
            for (const tokenizedAttribute of tokenizedAttributes) {
                delete element.attribs[tokenizedAttribute];
            }

            function processMxtEvent(mxtParts: string[], attrName: string, attrValue: string, attrState: AttributeTokenInfo) {

                const name = mxtParts[1];

                const de = getDynamicElement(element);

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

        function processMxtElement(element: Element, name: string) {

            switch (name) {
                case "component":
                    return processMxtComponent(componentFile, component, element);
                case "foreach":
                    return processMxtForeach(componentFile, component, element);
                case "if":
                    return processMxtIf(componentFile, component, element);
                case "import":
                    processMxtImport(componentFile, component, element);
                    removeElement(element);
                    return;
                case "switch":
                    return processMxtSwitch(componentFile, component, element);
                case "with":
                    return processMxtWith(componentFile, component, element);
                default:
                    componentFile.problemFromElement(ProblemCode.ERR003, element);
                    return;
            }
        }
    }


    function getDynamicElement(tagItem: Element) {

        const tagId = tagItem.attribs.id ? tagItem.attribs.id : "";

        let item = dynamicElements[tagId];
        if (!item) {

            const originalId = tagId ? tagId : "";
            tagItem.attribs.id = `tagid_${idindex++}`;
            item = {
                attributes: {},
                events: {},
                id: tagItem.attribs.id,
                originalId,
                embeddedParts: []
            };
            dynamicElements[tagItem.attribs.id] = item;
        }
        return item;
    }
}

export function processMxtForeach(componentFile: ComponentFile, component: Component, element: Element) {
    //<mxt.foreach in="${items}" [with=""]>
    // <div/>
    //</mxt.foreach>

    if (element.attribs.in === undefined) {
        componentFile.problemFromElement(ProblemCode.ERR012, element);
    }

    if (element.children.length > 0) {

        const innerPart = wrapAsPart(componentFile, component, element);
        if (innerPart && innerPart.partId) {

            const part = component.newPart<ForEach>({
                partId: innerPart.partId,
                forEach: parseInlineExpressions(element.attribs.in)
            });

            const partRef: PartReference = {
                partId: part.id
            };
            if (element.attribs.with) {
                partRef.dc = parseInlineExpressions(element.attribs.with);
            }

            return partRef;
        }
    }

    return;
}
export function processMxtSwitch(componentFile: ComponentFile, component: Component, element: Element) {
    // <mxt.switch on="${switchindex}" [with=""]>
    //     <mxt.case when="${0}" [with=""]>
    //         <div>Switch index 0</div>
    //     </mxt.case>
    //     <mxt.case when="${1}">
    //         <div>Switch index 1</div>
    //     </mxt.case>
    //     <mxt.case when="${2}">
    //         <div>Switch index 2</div>
    //     </mxt.case>
    //     <mxt.case when="${$on > 2}">
    //         <div>Greater then 2</div>
    //     </mxt.case>
    //     <mxt.default [with=""]>
    //         <div>Switch index default</div>
    //     </mxt.default>
    // </mxt.switch>

    const attrs = element.attribs;
    const part = component.newPart<SwitchSequence>({
        sequence: []
    });

    if (attrs.on) {
        part.switch = parseInlineExpressions(attrs.on)
    }

    const partRef: PartReference = {
        partId: part.id
    };
    if (element.attribs.with) {
        partRef.dc = parseInlineExpressions(element.attribs.with);
    }


    let defaultPart: PartReference | undefined;
    for (const el of element.children as Element[]) {

        if (el.name == "mxt.case") {
            if (!el.attribs.when) {
                componentFile.problemFromElement(ProblemCode.ERR011, el);
            }

            const subPart = wrapAsPart(componentFile, component, el);
            if (subPart) {
                const casePart: WhenPartReference =
                {
                    partId: subPart.partId,
                    when: parseInlineExpressions(attrs.when)
                };

                if (element.attribs.with) {
                    casePart.dc = parseInlineExpressions(el.attribs.with);
                }

                part.sequence.push(casePart);
            }

        } if (el.name == "mxt.default") {
            defaultPart = wrapAsPart(componentFile, component, el);
            if (defaultPart && element.attribs.with) {
                defaultPart.dc = parseInlineExpressions(el.attribs.with);
            }
        } else {
            componentFile.problemFromElement(ProblemCode.ERR010, element);
        }
    }
    if (defaultPart) {
        part.sequence.push(defaultPart);
    }

    return partRef;
}
export function processMxtImport(componentFile: ComponentFile, component: Component | undefined, element: Element) {
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
export function processMxtWith(componentFile: ComponentFile, component: Component, element: Element) {

    if (element.attribs.data === undefined) {
        componentFile.problemFromElement(ProblemCode.ERR006, element);
    }

    if (element.children.length > 0) {
        const innerPart = wrapAsPart(componentFile, component, element);
        if (innerPart) {
            if (element.attribs.data) {
                innerPart.dc = parseInlineExpressions(element.attribs.data);
            }
            return innerPart;
        }
    }
    return;
}
export function processMxtComponent(componentFile: ComponentFile, component: Component, element: Element) {
    // <mxt.component name="if01" />
    // <mxt.component from="../if01" as="something"/>
    // <mxt.component name="if01" from="./if01" />
    // <mxt.component name="if01" from="./if01" with="${inner}" />

    const attrs = element.attribs;
    let name = attrs.name;
    if (!name) {
        if (!attrs.from) {
            // have neither "name" nor "from"
            componentFile.problemFromElement(ProblemCode.ERR007, element);
            return;
        }
        if (!attrs.as) {
            // has "from" but neither "name" nor "as"
            componentFile.problemFromElement(ProblemCode.ERR008, element);
            return;
        }

        // no "name", but has "from" and "as"
        componentFile.imports.add(attrs.as, attrs.from);
        name = attrs.as;
    } else {
        if (attrs.from) {
            if (attrs.as) {
                componentFile.imports.add({ name: name, as: attrs.as }, attrs.from);
                name = attrs.as;
            } else {
                componentFile.imports.add({ name: name }, attrs.from);
            }
        }
    }

    // regiser import
    const partId = component.addComponentImport(name);

    const part = component.newPart<ComponentRef>({ componentId: name }, partId);
    const partRef: PartReference = {
        partId: part.id
    };
    if (element.attribs.with) {
        partRef.dc = parseInlineExpressions(element.attribs.with);
    }

    return partRef;
}
export function processMxtIf(componentFile: ComponentFile, component: Component, element: Element) {
    // <mxt.if condition="${foo}" [with=""]>
    //   <div/>
    // </mxt.if> 
    //             => 
    // <mxt.switch>
    //      <mxt.case when="${foo}" [with=""]>
    //          <div/>
    //      </mxt.case>
    // </mxt.switch>

    if (element.attribs.condition === undefined) {
        componentFile.problemFromElement(ProblemCode.ERR009, element);
    }

    if (element.children.length > 0) {
        const innerPart = wrapAsPart(componentFile, component, element);
        if (innerPart && innerPart.partId) {


            const part = component.newPart<SwitchSequence>({
                sequence: [
                    {
                        partId: innerPart.partId,
                        when: parseInlineExpressions(element.attribs.condition)
                    }]
            });

            const partRef: PartReference = {
                partId: part.id
            };
            if (element.attribs.with) {
                partRef.dc = parseInlineExpressions(element.attribs.with);
            }

            return partRef;
        }
    }
    return;
}

export default processTemplate;
