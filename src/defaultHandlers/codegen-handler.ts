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

    // componentFile.componentStatements




    // componentFile.addImport({ name: "autorun", as: "autorun" }, "mobx");

    // // create definitions code
    // for (const templateId in componentFile.templates) {
    //     if (componentFile.templates.hasOwnProperty(templateId)) {
    //         const template = componentFile.templates[templateId];

    //         const constTemplateName = names.template(template);

    //         const templateLiteral = d.Literal(getHTML(template.elements));

    //         componentFile.initStatements.add(

    //             d.ConstVariable(constTemplateName, d.Call("document.createElement", d.Literal("template"))),

    //             ts.createStatement(d.Assignment(constTemplateName + ".innerHTML", templateLiteral))
    //         );

    //         const elements = Object.values(template.dynamicElements);

    //         const eventListeners: Array<{ elementName: string, eventName: string, elementEventFunction: string }> = [];

    //         const addlFuncBody = d.StatementList();


    //         const funcBody = d.StatementList()

    //             .add(d.LetVariable("disposed", false))
    //             .add(d.ConstObjectBindingVariable(
    //                 [names.elements,
    //                 ...elements.map(e => names.elementName(e))],
    //                 d.Call(names.initialize, constTemplateName, d.Literal(elements.map(e => e.id)))));

    //         for (const element of elements) {

    //             const elementName = names.elementName(element);
    //             const elementAutorun = names.elementAutorun(element);

    //             const elementOriginalId = element.originalId;

    //             const tokenSet = Object.values(element.attributes);

    //             const events = (element.events !== undefined) ? Object.values(element.events) : [];

    //             const externalReferences = Object.keys(tokenSet.reduce<{ [name: string]: any }>((e, i) => {
    //                 for (const er of i.externalReferences) {
    //                     e[er] = null;
    //                 }
    //                 return e;
    //             }, {}))

    //             if (elementOriginalId !== undefined) {
    //                 funcBody
    //                     .add(ts.createStatement(d.Assignment(`${elementName}.id`, elementOriginalId)));
    //             }

    //             for (const event of events) {

    //                 const elementEventFunction = eventFunctionName(element.id, event);

    //                 let df = d.FunctionDeclaration(elementEventFunction)
    //                     .addParameter(d.Parameter("ev", "Event"))
    //                 if (event.handler) {
    //                     df.addBody(
    //                         d.ConstObjectBindingVariable([event.handler], ts.createIdentifier("data")),

    //                         // bind function


    //                         d.Call(d.Call(`${event.handler}.bind`, "data"), ts.createIdentifier("ev")));
    //                 }

    //                 if (event.preventDefault) {
    //                     df.addBody(d.Call("ev.preventDefault"))
    //                 }
    //                 if (event.stopPropagation) {
    //                     df.addBody(d.Call("ev.stopPropagation"))
    //                 }
    //                 if (event.stopImmediatePropagation) {
    //                     df.addBody(d.Call("ev.stopImmediatePropagation"))
    //                 }

    //                 addlFuncBody.add(df);

    //                 const options: string[] = [];
    //                 if (event.once) { options.push("once: true") }
    //                 if (event.passive) { options.push("passive: true") }
    //                 if (event.capture) { options.push("capture: true") }

    //                 const evFunction = d.Call(elementName + ".addEventListener", d.Literal(event.name), elementEventFunction);
    //                 eventListeners.push({ elementName, eventName: event.name, elementEventFunction });
    //                 if (options.length) {
    //                     evFunction.addArg("{" + options.join(", ") + "}");
    //                 }

    //                 funcBody.add(evFunction);

    //             }

    //             funcBody.add(
    //                 d.ConstVariable(elementAutorun, d.Call("autorun",
    //                     d.ArrowFunction(
    //                         d.ConstObjectBindingVariable(externalReferences, ts.createIdentifier("data")),
    //                         ...tokenSet.map(token => d.Call(elementName + ".setAttribute", d.Literal(token.attributeName), d.TemplateLiteral(token.content))))
    //                 )));
    //         }


    //         funcBody.add(ts.createIf(ts.createIdentifier("host"), ts.createStatement(d.Call(names.appendTo, names.elements, "host"))))

    //             .add(d.Return(
    //                 ts.createObjectLiteral(
    //                     [
    //                         d.GetAccessor("disposed", d.Return(ts.createIdentifier("disposed"))),
    //                         d.GetAccessor("elements", d.Return(ts.createIdentifier(names.elements))),
    //                         ts.createPropertyAssignment("appendTo",
    //                             d.ArrowFunction()
    //                                 .addParameter(d.Parameter("host", "Element"))
    //                                 .addBody(d.Call(names.appendTo, names.elements, "host"))
    //                         ),
    //                         d.PropertyAssignment("remove",
    //                             d.ArrowFunction(d.Call(names.remove, names.elements))
    //                         ),
    //                         d.PropertyAssignment("dispose",
    //                             d.ArrowFunction(d.Assignment("disposed", true),
    //                                 d.Call(names.remove, names.elements),
    //                                 d.Call(names.elements + ".splice", d.Literal(0), names.elements + ".length"),
    //                                 ...eventListeners.map(e => d.Call(`${e.elementName}.removeEventListener`, d.Literal(e.eventName), e.elementEventFunction)),
    //                                 ...elements.map(e => d.Call(names.elementAutorun(e))))
    //                         )
    //                     ], true
    //                 )
    //             ));

    //         funcBody.add(...addlFuncBody);

    //         const funcDeclaration = d.FunctionDeclaration(template.id, ...funcBody)
    //             .addParameter(d.Parameter("data", "any"), d.Parameter("host", null, undefined, "Element").optional)
    //             .export;

    //         // const code = generateCode(funcDeclaration);
    //         // console.info(code);

    //         componentFile.componentStatements.add(funcDeclaration);

    //     }
    // }


    // componentFile.componentStatements
    //     .add(
    //         d.FunctionDeclaration(names.initialize)
    //             .addParameter(d.Parameter("template", "HTMLTemplateElement"))
    //             .addParameter(d.Parameter("elementIds", "string[]"))
    //             .addBody(
    //                 d.ConstVariable("elements", d.Literal([]), "Element[]")
    //                 , (d.LetVariable("child", ts.createIdentifier("template.content.firstElementChild")))
    //                 , (ts.createWhile(ts.createIdentifier("child"),
    //                     ts.createBlock(
    //                         [
    //                             ts.createStatement(d.Call("elements.push", "child")),
    //                             ts.createStatement(d.Assignment("child", ts.createIdentifier("child.nextElementSibling")))
    //                         ]
    //                     )
    //                 ))
    //                 , (d.ConstVariable("context", ts.createObjectLiteral(
    //                     [d.PropertyAssignment(names.elements, ts.createIdentifier("elements"))]
    //                 ), "any"))

    //                 , (d.ForOf("elementId", "elementIds",
    //                     d.ConstVariable("element", d.Call("template.content.getElementById", "elementId")),
    //                     ts.createIf(ts.createIdentifier("element"),
    //                         ts.createBlock([
    //                             ts.createStatement(d.Assignment("context[elementId + \"$$element\"]", ts.createIdentifier("element")))]))

    //                 )
    //                 )
    //                 , (d.Return(ts.createIdentifier("context")))
    //             )
    //     )
    //     .add(
    //         d.FunctionDeclaration(names.appendTo, d.ForOf("el", "elements", d.Call("host.appendChild", "el")))
    //             .addParameter(d.Parameter("elements", "Element[]"))
    //             .addParameter(d.Parameter("host", "Element")
    //             ))
    //     .add(
    //         d.FunctionDeclaration(names.remove, d.ForOf("el", "elements", d.Call("el.remove")))
    //             .addParameter(d.Parameter("elements", "Element[]"))
    //     )


    return true;
}

