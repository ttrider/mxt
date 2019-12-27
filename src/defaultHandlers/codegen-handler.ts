import { HandlerContext } from "..";
import ts from "typescript";
import { statements, declareFunction, declareVar, declareObjectDestruction, makeTemplateLiteral, makeAssignment, makeThrow, makeCall } from "../ts/builder";
import { ComponentFile } from "../component-file";


export function codegen(context: HandlerContext, componentFile: ComponentFile) {

    componentFile.addImport("autorun", "mobx");

    // create definitions code
    for (const templateId in componentFile.templates) {
        if (componentFile.templates.hasOwnProperty(templateId)) {
            const template = componentFile.templates[templateId];

            const constTemplateName = `${template.id}$$template`;

            const templateLiteral = makeTemplateLiteral(template.elements);


            componentFile.initStatements.add(

                declareVar(constTemplateName)
                    .const
                    .init(makeCall("document.createElement", "template")),

                ts.createStatement(makeAssignment(constTemplateName + ".innerHTML", templateLiteral))
            );

        }
    }

    // create init function code
    for (const templateId in componentFile.templates) {
        if (componentFile.templates.hasOwnProperty(templateId)) {
            const template = componentFile.templates[templateId];
            const constTemplateName = `${template.id}$$template`;

            const elements = Object.values(template.dynamicElements);




            const addlFuncBody = statements();


            const funcBody = statements()
                .add(
                    declareVar("disposed")
                        .let
                        .init(ts.createFalse()))

                .add(
                    declareObjectDestruction({ name: "$$elements" }, ...elements.map(e => { return { name: `${e.id}$$element` } }))
                        .const
                        .init(makeCall("$$mxt$$initialize$$", ts.createIdentifier(constTemplateName), ts.createArrayLiteral(elements.map(e => ts.createStringLiteral(e.id))))
                            .build()
                        ))

            for (const elementId in template.dynamicElements) {
                if (template.dynamicElements.hasOwnProperty(elementId)) {
                    const element = template.dynamicElements[elementId];

                    const elementName = `${elementId}$$element`;
                    const elementAutorun = `${elementId}$$autorun`;

                    const elementOriginalId = element.originalId;

                    const tokenSet = Object.values(element.attributes);

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

                    if (element.events) {
                        for (const eventName in element.events) {
                            if (element.events.hasOwnProperty(eventName)) {
                                const event = element.events[eventName];

                                const elementEventFunction = `${elementId}$$${eventName}`;

                                const df = declareFunction(elementEventFunction)
                                    .param("ev", "Event");
                                if (event.handler) {
                                    df.body(declareObjectDestruction({ name: event.handler }).const.init(ts.createIdentifier("data")))
                                        .body(makeCall(event.handler, ts.createIdentifier("ev")).build())
                                }

                                if (event.preventDefault) {
                                    df.body(makeCall("ev.preventDefault").build())
                                }
                                if (event.stopPropagation) {
                                    df.body(makeCall("ev.stopPropagation").build())
                                }
                                if (event.stopImmediatePropagation) {
                                    df.body(makeCall("ev.stopImmediatePropagation").build())
                                }

                                addlFuncBody.add(df.build());

                                const options: string[] = [];
                                if (event.once) { options.push("once") }
                                if (event.passive) { options.push("passive") }
                                if (event.capture) { options.push("capture") }

                                const evFunction = makeCall(elementName + ".addEventListener", eventName, ts.createIdentifier(elementEventFunction));
                                if (options.length) {
                                    evFunction.param(ts.createIdentifier("{" + options.join(", ") + "}"));
                                }

                                funcBody.add(evFunction.build());

                            }
                        }
                    }

                    funcBody.add(
                        declareVar(elementAutorun)
                            .const
                            .init(
                                makeCall("autorun", declareFunction()
                                    .body(declareObjectDestruction(...externalReferences).const.init(ts.createIdentifier("data")))
                                    .body(...tokenSet.map(token => makeCall(elementName + ".setAttribute", token.attributeName, makeTemplateLiteral(token.content)).build()))
                                ).build()));
                }
            }

            funcBody.add(ts.createIf(ts.createIdentifier("host"), ts.createStatement(makeCall("$$mxt$$appendTo$$", ts.createIdentifier("$$elements"), ts.createIdentifier("host")).build())))
                .add(ts.createReturn(ts.createIdentifier("component.content")));

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
            declareFunction("$$mxt$$initialize$$")
                .param("template", "HTMLTemplateElement")
                .param("elementIds", "string[]")
                .body(declareVar("elements", "Element[]").const.init(ts.createArrayLiteral()))
                .body(declareVar("child").let.init(ts.createIdentifier("template.content.firstElementChild")))
                .body(ts.createWhile(ts.createIdentifier("child"),
                    ts.createBlock(
                        [
                            ts.createStatement(makeCall("elements.push", ts.createIdentifier("child")).build()),
                            ts.createStatement(makeAssignment("child", ts.createIdentifier("child.nextElementSibling")))
                        ]
                    )
                ))
                .body(declareVar("context", "any").const.init(
                    ts.createObjectLiteral(
                        [ts.createPropertyAssignment("$$elements", ts.createIdentifier("elements"))]
                    )
                ))

                .body(ts.createForOf(undefined, ts.createIdentifier("elementId"), ts.createIdentifier("elementIds"),
                    ts.createBlock(
                        [
                            declareVar("element").const.init(makeCall("template.content.getElementById", ts.createIdentifier("elementId"))).build(),
                            ts.createIf(ts.createIdentifier("element"),
                                ts.createBlock([
                                    ts.createStatement(makeAssignment("context[elementId + \"$$element\"]", ts.createIdentifier("element")))]))
                        ]
                    )
                ))
                .body(ts.createReturn(ts.createIdentifier("context")))
                .build())
        .add(
            declareFunction("$$mxt$$appendTo$$")
                .param("elements", "Element[]")
                .param("host", "Element")
                .body(ts.createForOf(undefined, ts.createIdentifier("el"), ts.createIdentifier("elements"), ts.createStatement(makeCall("host.appendChild", ts.createIdentifier("el")).build())))
                .build()
        )
        .add(
            declareFunction("$$mxt$$remove$$")
                .param("elements", "Element[]")
                .body(ts.createForOf(undefined, ts.createIdentifier("el"), ts.createIdentifier("elements"), ts.createStatement(makeCall("el.remove").build())))
                .build()


        )
    return true;
}
