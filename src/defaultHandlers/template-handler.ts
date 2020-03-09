import { TemplateInfo, AttributeTokenInfo, DynamicElementInfo } from "../index";
import { Element, DataNode } from "domhandler";
import { ElementType } from "domelementtype";
import { ComponentFile } from "../component-file";
import { parseInlineExpressions } from "../ast/ts";
import getElementInfo from "../dom/elementInfo";
import { removeElement } from "domutils";
import processStyle from "./style-handler";
import { ProblemCode } from "../problem";
import { Component } from "../component";
import { SwitchSequence, PartReference, WhenPartReference, ComponentRef, ForEach, Template } from "../template-parts";

let idindex = 1;


//<mxt.component name="if01" from="./if01" with="${inner2}" />
//<mxt.import name="if03" from="./if03" as="f0000" />
//<mxt.with data="${inner}">
//<mxt.if></mxt.if>
//<mxt.foreach data="${items}"></mxt.foreach data="${items}"> 
//<mxt.switch on="${switchindex}"><mxt.case when="${0}"></mxt.case><mxt.default></mxt.default></mxt.switch>


declare type Context = {
    componentFile: ComponentFile,
    component: Component,
    styleElements: Element[]
};


export async function processTemplate(componentFile: ComponentFile, templateElement: Element) {

    const component_id = templateElement.attribs.id;
    const component = new Component(component_id);

    componentFile.components[component_id] = component;

    const context: Context = {
        componentFile,
        component,
        styleElements: []
    };

    const rootPart = wrapAsPart(context, templateElement);

    component.rootPart = rootPart;

    for (const styleElement of context.styleElements) {
        await processStyleElement(context, styleElement);
    }

    return true;

}

export function wrapAsPart(context: Context, element: Element) {
    const { componentFile, component } = context;

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
                    context.styleElements.push(el);
                    removeElement(el);
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
                    return processMxtComponent(context, element);
                case "foreach":
                    return processMxtForeach(context, element);
                case "if":
                    return processMxtIf(context, element);
                case "import":
                    processMxtImport(context, element);
                    removeElement(element);
                    return;
                case "switch":
                    return processMxtSwitch(context, element);
                case "with":
                    return processMxtWith(context, element);
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

export function processMxtForeach(context: Context, element: Element) {
    //<mxt.foreach in="${items}" [with=""]>
    // <div/>
    //</mxt.foreach>
    const { componentFile, component } = context;

    if (element.attribs.in === undefined) {
        componentFile.problemFromElement(ProblemCode.ERR012, element);
    }

    if (element.children.length > 0) {

        const innerPart = wrapAsPart(context, element);
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
export function processMxtSwitch(context: Context, element: Element) {
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
    const { componentFile, component } = context;

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

            const subPart = wrapAsPart(context, el);
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
            defaultPart = wrapAsPart(context, el);
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
export function processMxtImport(context: Context, element: Element) {
    //<mxt.import from="./if03" as="foo"/>              -> import foo from "./if03
    //<mxt.import from="./if03" name="foo"/>            -> import {foo} from "./if03
    //<mxt.import from="./if03" name="foo" as="bar"/>   -> import {foo as bar} from "./if03
    const { componentFile } = context;
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
export function processMxtWith(context: Context, element: Element) {
    const { componentFile, component } = context;

    if (element.attribs.data === undefined) {
        componentFile.problemFromElement(ProblemCode.ERR006, element);
    }

    if (element.children.length > 0) {
        const innerPart = wrapAsPart(context, element);
        if (innerPart) {
            if (element.attribs.data) {
                innerPart.dc = parseInlineExpressions(element.attribs.data);
            }
            return innerPart;
        }
    }
    return;
}
export function processMxtComponent(context: Context, element: Element) {
    // <mxt.component name="if01" />
    // <mxt.component from="../if01" as="something"/>
    // <mxt.component name="if01" from="./if01" />
    // <mxt.component name="if01" from="./if01" with="${inner}" />
    const { componentFile, component } = context;

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
export function processMxtIf(context: Context, element: Element) {
    // <mxt.if condition="${foo}" [with=""]>
    //   <div/>
    // </mxt.if> 
    //             => 
    // <mxt.switch>
    //      <mxt.case when="${foo}" [with=""]>
    //          <div/>
    //      </mxt.case>
    // </mxt.switch>
    const { componentFile, component } = context;

    if (element.attribs.condition === undefined) {
        componentFile.problemFromElement(ProblemCode.ERR009, element);
    }

    if (element.children.length > 0) {
        const innerPart = wrapAsPart(context, element);
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

export async function processStyleElement(context: Context, element: Element) {
    const { componentFile, component } = context;

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

export default processTemplate;
