import { HandlerContext, Eventinfo, ElementInfo, TemplateInfo, DynamicElementInfo, IdInfo } from "..";
import ts from "typescript";
import { statements, declareFunction, declareVar, declareObjectDestruction, makeTemplateLiteral, makeAssignment, makeThrow, forOf } from "../ts/builder";
import * as d from "../ts/builder";

import { ComponentFile } from "../component-file";

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

    componentFile.addImport("autorun", "mobx");

    // create definitions code
    for (const templateId in componentFile.templates) {
        if (componentFile.templates.hasOwnProperty(templateId)) {
            const template = componentFile.templates[templateId];

            const constTemplateName = names.template(template);

            const templateLiteral = makeTemplateLiteral(template.elements);


            componentFile.initStatements.add(

                declareVar(constTemplateName)
                    .const
                    .init(d.Call("document.createElement", d.Literal("template"))),

                ts.createStatement(makeAssignment(constTemplateName + ".innerHTML", templateLiteral))
            );

            const elements = Object.values(template.dynamicElements);

            const eventListeners: Array<{ elementName: string, eventName: string, elementEventFunction: string }> = [];




            const addlFuncBody = statements();


            const funcBody = statements()
                .add(
                    declareVar("disposed")
                        .let
                        .init(ts.createFalse()))

                .add(
                    declareObjectDestruction({ name: names.elements }, ...elements.map(e => { return { name: names.elementName(e) } }))
                        .const
                        .init(d.Call(names.initialize, constTemplateName, d.Literal(elements.map(e => e.id)))
                        ))

            for (const element of elements) {

                const elementName = names.elementName(element);
                const elementAutorun = names.elementAutorun(element);

                const elementOriginalId = element.originalId;

                const tokenSet = Object.values(element.attributes);

                const events = (element.events !== undefined) ? Object.values(element.events) : [];

                const externalReferences = Object.keys(tokenSet.reduce<{ [name: string]: any }>((e, i) => {
                    for (const er of i.externalReferences) {
                        e[er] = null;
                    }
                    return e;
                }, {}))
                    .map(er => { return { name: er }; });

                if (elementOriginalId !== undefined) {
                    funcBody
                        .add(ts.createStatement(makeAssignment(`${elementName}.id`, elementOriginalId)));
                }

                for (const event of events) {

                    const elementEventFunction = eventFunctionName(element.id, event);

                    const df = declareFunction(elementEventFunction)
                        .param("ev", "Event");
                    if (event.handler) {
                        df.body(declareObjectDestruction({ name: event.handler }).const.init(ts.createIdentifier("data")))
                            .body(d.Call(event.handler, "ev"))
                    }

                    if (event.preventDefault) {
                        df.body(d.Call("ev.preventDefault"))
                    }
                    if (event.stopPropagation) {
                        df.body(d.Call("ev.stopPropagation"))
                    }
                    if (event.stopImmediatePropagation) {
                        df.body(d.Call("ev.stopImmediatePropagation"))
                    }

                    addlFuncBody.add(df.build());

                    const options: string[] = [];
                    if (event.once) { options.push("once: true") }
                    if (event.passive) { options.push("passive: true") }
                    if (event.capture) { options.push("capture: true") }

                    const evFunction = d.Call(elementName + ".addEventListener", d.Literal(event.name), elementEventFunction);
                    eventListeners.push({ elementName, eventName: event.name, elementEventFunction });
                    if (options.length) {
                        evFunction.addArg("{" + options.join(", ") + "}");
                    }

                    funcBody.add(evFunction);

                }



                funcBody.add(
                    declareVar(elementAutorun)
                        .const
                        .init(
                            d.Call("autorun",
                                d.ArrowFunction(
                                    declareObjectDestruction(...externalReferences).const.init(ts.createIdentifier("data")).build(),
                                    ...tokenSet.map(token => d.Call(elementName + ".setAttribute", d.Literal(token.attributeName), makeTemplateLiteral(token.content))))
                            )));



            }


            funcBody.add(ts.createIf(ts.createIdentifier("host"), ts.createStatement(d.Call(names.appendTo, names.elements, "host"))))

                .add(d.Return(
                    ts.createObjectLiteral(
                        [
                            d.GetAccessor("disposed", d.Return(ts.createIdentifier("disposed"))),
                            d.GetAccessor("elements", d.Return(ts.createIdentifier(names.elements))),
                            ts.createPropertyAssignment(
                                "appendTo",
                                d.ArrowFunction()
                                    .addParameter(d.Parameter("host", "Element"))
                                    .addBody(d.Call(names.appendTo, names.elements, "host"))
                            ),
                            ts.createPropertyAssignment(
                                "remove",
                                d.ArrowFunction(d.Call(names.remove, names.elements))
                            ),
                            ts.createPropertyAssignment(
                                "dispose",
                                d.ArrowFunction(makeAssignment("disposed", true),
                                    d.Call(names.remove, names.elements),
                                    d.Call(names.elements + ".splice", d.Literal(0), names.elements + ".length"),
                                    ...eventListeners.map(e => d.Call(`${e.elementName}.removeEventListener`, d.Literal(e.eventName), e.elementEventFunction)),
                                    ...elements.map(e => d.Call(names.elementAutorun(e))))
                            )
                        ], true
                    )
                ));






            funcBody.add(addlFuncBody.build());

            componentFile.componentStatements.add(
                declareFunction(template.id)
                    .param("data")
                    .param("host", null, undefined, "Element")
                    .body(funcBody.build())
                    .export
                    .build());

        }
    }


    componentFile.componentStatements
        .add(
            declareFunction(names.initialize)
                .param("template", "HTMLTemplateElement")
                .param("elementIds", "string[]")
                .body(declareVar("elements", "Element[]").const.init(ts.createArrayLiteral()))
                .body(declareVar("child").let.init(ts.createIdentifier("template.content.firstElementChild")))
                .body(ts.createWhile(ts.createIdentifier("child"),
                    ts.createBlock(
                        [
                            ts.createStatement(d.Call("elements.push", "child")),
                            ts.createStatement(makeAssignment("child", ts.createIdentifier("child.nextElementSibling")))
                        ]
                    )
                ))
                .body(declareVar("context", "any").const.init(
                    ts.createObjectLiteral(
                        [ts.createPropertyAssignment(names.elements, ts.createIdentifier("elements"))]
                    )
                ))

                .body(forOf("elementId").of(ts.createIdentifier("elementIds"))
                    .body(ts.createBlock(
                        [
                            declareVar("element").const.init(d.Call("template.content.getElementById", "elementId")).build(),
                            ts.createIf(ts.createIdentifier("element"),
                                ts.createBlock([
                                    ts.createStatement(makeAssignment("context[elementId + \"$$element\"]", ts.createIdentifier("element")))]))
                        ]
                    ))
                )
                .body(ts.createReturn(ts.createIdentifier("context")))
                .build())
        .add(
            declareFunction(names.appendTo)
                .param("elements", "Element[]")
                .param("host", "Element")
                .body(d.ForOf("el", "elements", d.Call("host.appendChild", "el"))).build())
        .add(
            declareFunction(names.remove)
                .param("elements", "Element[]")
                .body(forOf("el").of(ts.createIdentifier("elements")).body(ts.createStatement(d.Call("el.remove")))).build())


    return true;
}

