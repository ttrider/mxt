import { HandlerContext, Eventinfo, TemplateInfo, IdInfo } from "..";
import ts from "typescript";
import * as d from "../ts";
import { getHTML } from "../dom/html";

import { ComponentFile } from "../component-file";
import { generateCode } from "../ts";


function eventFunctionName(elementId: string, event: Eventinfo) {
    return `${elementId}$$${event.name}`
}

const names = {
    template: (template: TemplateInfo) => `${template.id}$$template`,

    elementName: (element: IdInfo) => `${element.id}$$element`,
    elementAutorun: (element: IdInfo) => `${element.id}$$autorun`,

    initialize: "$$mxt$$initialize$$",
    remove: "$$mxt$$remove$$",
    appendTo: "$$mxt$$appendTo$$",
    elements: "$$mxt$$elements$$"
}


export function codegen(context: HandlerContext, componentFile: ComponentFile) {

    componentFile.addImport("$r$", "../mxt-rt");

    const componentsObj = d.ObjectLiteral();
    const partsObj = d.ObjectLiteral();

    const templateNames: string[] = [];

    const config = d.ObjectLiteral()
        .addProperty("components", componentsObj)
        .addProperty("parts", partsObj);


    for (const componentId in componentFile.components) {
        if (componentFile.components.hasOwnProperty(componentId)) {
            templateNames.push(componentId);

            const component = componentFile.components[componentId];

            // simple root component
            componentsObj.addProperty(componentId, component.rootPart);

            // process parts
            for (const partId in component.parts) {
                if (component.parts.hasOwnProperty(partId)) {
                    const part = component.parts[partId];

                    const partObj = d.ObjectLiteral();
                    partObj.addProperty("template", d.Literal(getHTML(part.elements)));

                    if (part.dynamicElements) {

                        const eitems: ts.Expression[] = [];


                        for (const de in part.dynamicElements) {
                            if (part.dynamicElements.hasOwnProperty(de)) {
                                const element = part.dynamicElements[de];

                                const eitem = d.ObjectLiteral().addProperty("id", element.id);
                                if (element.originalId) {
                                    eitem.addProperty("originalId", element.originalId);
                                }

                                // element.attributes

                                const tokenSet = Object.values(element.attributes);

                                const externalReferences = Object.keys(tokenSet.reduce<{ [name: string]: any }>((e, i) => {
                                    for (const er of i.externalReferences) {
                                        e[er] = null;
                                    }
                                    return e;
                                }, {}));

                                eitem.addProperty("attrs",
                                    d.ArrowFunction(
                                        d.ConstObjectBindingVariable(externalReferences, ts.createIdentifier("$dc$.$data")),
                                        d.Return(
                                            tokenSet.reduce((ol, token) => {
                                                return ol.addProperty(token.attributeName, d.TemplateLiteral(token.content));
                                            }, d.ObjectLiteral()))
                                    ).addParameter(d.Parameter("$dc$")));


                                if (element.events) {
                                    const evitems: ts.Expression[] = [];
                                    for (const elid in element.events) {
                                        if (element.events.hasOwnProperty(elid)) {
                                            const event = element.events[elid];

                                            if (event.handler) {
                                                let flag = 0;
                                                if (event.preventDefault) flag |= 0x001;
                                                if (event.stopPropagation) flag |= 0x002;
                                                if (event.stopImmediatePropagation) flag |= 0x004;
                                                if (event.once) flag |= 0x008;
                                                if (event.passive) flag |= 0x010;
                                                if (event.capture) flag |= 0x020;

                                                evitems.push(d.ObjectLiteral()
                                                    .addProperty("name", event.name)
                                                    .addProperty("flags", flag)
                                                    .addProperty("handler", d.ArrowFunction(
                                                        d.ConstObjectBindingVariable([event.handler], ts.createIdentifier("$dc$.$data")),
                                                        d.Call(
                                                            d.Call(event.handler + ".bind", ts.createIdentifier("$dc$.$data")),
                                                            ts.createIdentifier("$ev$"),
                                                            ts.createIdentifier("$dc$.$data"),
                                                            ts.createIdentifier("$dc$")
                                                        )
                                                    ).addParameter(d.Parameter("$ev$", "Event"))
                                                        .addParameter(d.Parameter("$dc$", "any"))));

                                            }


                                        }
                                    }

                                    if (evitems.length > 0) { eitem.addProperty("events", ts.createArrayLiteral(evitems)); }
                                }

                                eitems.push(eitem);
                            }

                            if (eitems.length > 0) { partObj.addProperty("attachTo", ts.createArrayLiteral(eitems)); }
                        }
                    }

                    partsObj.addProperty(partId, d.ArrowFunction(d.Return(partObj)).addParameter(d.Parameter("$pf$")));

                }
            }
        }
    }

    componentFile.componentStatements.add(
        d.ConstObjectBindingVariable(templateNames,
            d.Call("$r$", config)));


    componentFile.componentStatements.add(ts.createExportDeclaration(undefined, undefined, ts.createNamedExports(templateNames.map(i => ts.createExportSpecifier(undefined, i)))));

    if (templateNames.length === 1) {
        componentFile.componentStatements.add(ts.createExportDefault(ts.createIdentifier(templateNames[0])));
    }

    


    return true;
}

