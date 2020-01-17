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

    componentFile.addImport("autorun", "mobx");

    // create definitions code
    for (const templateId in componentFile.templates) {
        if (componentFile.templates.hasOwnProperty(templateId)) {
            const template = componentFile.templates[templateId];

            const constTemplateName = names.template(template);

            const templateLiteral = d.Literal(getHTML(template.elements));

            componentFile.initStatements.add(

                d.ConstVariable(constTemplateName, d.Call("document.createElement", d.Literal("template"))),

                ts.createStatement(d.Assignment(constTemplateName + ".innerHTML", templateLiteral))
            );

            const elements = Object.values(template.dynamicElements);

            const eventListeners: Array<{ elementName: string, eventName: string, elementEventFunction: string }> = [];

            const addlFuncBody = d.StatementList();


            const funcBody = d.StatementList()

                .add(d.LetVariable("disposed", false))
                .add(d.ConstObjectBindingVariable(
                    [names.elements,
                    ...elements.map(e => names.elementName(e))],
                    d.Call(names.initialize, constTemplateName, d.Literal(elements.map(e => e.id)))));

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

                if (elementOriginalId !== undefined) {
                    funcBody
                        .add(ts.createStatement(d.Assignment(`${elementName}.id`, elementOriginalId)));
                }

                for (const event of events) {

                    const elementEventFunction = eventFunctionName(element.id, event);

                    let df = d.FunctionDeclaration(elementEventFunction)
                        .addParameter(d.Parameter("ev", "Event"))
                    if (event.handler) {
                        df.addBody(
                            d.ConstObjectBindingVariable([event.handler], ts.createIdentifier("data")),

                            // bind function


                            d.Call(d.Call(`${event.handler}.bind`, "data"), ts.createIdentifier("ev")));
                    }

                    if (event.preventDefault) {
                        df.addBody(d.Call("ev.preventDefault"))
                    }
                    if (event.stopPropagation) {
                        df.addBody(d.Call("ev.stopPropagation"))
                    }
                    if (event.stopImmediatePropagation) {
                        df.addBody(d.Call("ev.stopImmediatePropagation"))
                    }

                    addlFuncBody.add(df);

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
                    d.ConstVariable(elementAutorun, d.Call("autorun",
                        d.ArrowFunction(
                            d.ConstObjectBindingVariable(externalReferences, ts.createIdentifier("data")),
                            ...tokenSet.map(token => d.Call(elementName + ".setAttribute", d.Literal(token.attributeName), d.TemplateLiteral(token.content))))
                    )));
            }


            funcBody.add(ts.createIf(ts.createIdentifier("host"), ts.createStatement(d.Call(names.appendTo, names.elements, "host"))))

                .add(d.Return(
                    ts.createObjectLiteral(
                        [
                            d.GetAccessor("disposed", d.Return(ts.createIdentifier("disposed"))),
                            d.GetAccessor("elements", d.Return(ts.createIdentifier(names.elements))),
                            ts.createPropertyAssignment("appendTo",
                                d.ArrowFunction()
                                    .addParameter(d.Parameter("host", "Element"))
                                    .addBody(d.Call(names.appendTo, names.elements, "host"))
                            ),
                            d.PropertyAssignment("remove",
                                d.ArrowFunction(d.Call(names.remove, names.elements))
                            ),
                            d.PropertyAssignment("dispose",
                                d.ArrowFunction(d.Assignment("disposed", true),
                                    d.Call(names.remove, names.elements),
                                    d.Call(names.elements + ".splice", d.Literal(0), names.elements + ".length"),
                                    ...eventListeners.map(e => d.Call(`${e.elementName}.removeEventListener`, d.Literal(e.eventName), e.elementEventFunction)),
                                    ...elements.map(e => d.Call(names.elementAutorun(e))))
                            )
                        ], true
                    )
                ));

            funcBody.add(...addlFuncBody);

            const funcDeclaration = d.FunctionDeclaration(template.id, ...funcBody)
                .addParameter(d.Parameter("data", "any"), d.Parameter("host", null, undefined, "Element").optional)
                .export;

            // const code = generateCode(funcDeclaration);
            // console.info(code);

            componentFile.componentStatements.add(funcDeclaration);

        }
    }


    componentFile.componentStatements
        .add(
            d.FunctionDeclaration(names.initialize)
                .addParameter(d.Parameter("template", "HTMLTemplateElement"))
                .addParameter(d.Parameter("elementIds", "string[]"))
                .addBody(
                    d.ConstVariable("elements", d.Literal([]), "Element[]")
                    , (d.LetVariable("child", ts.createIdentifier("template.content.firstElementChild")))
                    , (ts.createWhile(ts.createIdentifier("child"),
                        ts.createBlock(
                            [
                                ts.createStatement(d.Call("elements.push", "child")),
                                ts.createStatement(d.Assignment("child", ts.createIdentifier("child.nextElementSibling")))
                            ]
                        )
                    ))
                    , (d.ConstVariable("context", ts.createObjectLiteral(
                        [d.PropertyAssignment(names.elements, ts.createIdentifier("elements"))]
                    ), "any"))

                    , (d.ForOf("elementId", "elementIds",
                        d.ConstVariable("element", d.Call("template.content.getElementById", "elementId")),
                        ts.createIf(ts.createIdentifier("element"),
                            ts.createBlock([
                                ts.createStatement(d.Assignment("context[elementId + \"$$element\"]", ts.createIdentifier("element")))]))

                    )
                    )
                    , (d.Return(ts.createIdentifier("context")))
                )
        )
        .add(
            d.FunctionDeclaration(names.appendTo, d.ForOf("el", "elements", d.Call("host.appendChild", "el")))
                .addParameter(d.Parameter("elements", "Element[]"))
                .addParameter(d.Parameter("host", "Element")
                ))
        .add(
            d.FunctionDeclaration(names.remove, d.ForOf("el", "elements", d.Call("el.remove")))
                .addParameter(d.Parameter("elements", "Element[]"))
        )


    return true;
}

