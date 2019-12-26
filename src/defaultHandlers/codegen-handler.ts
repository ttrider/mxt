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

            const funcBody = statements().add(
                declareVar("component")
                    .const
                    .init(makeCall("document.importNode", ts.createIdentifier(constTemplateName), true))
            );

            for (const elementId in template.dynamicElements) {
                if (template.dynamicElements.hasOwnProperty(elementId)) {
                    const element = template.dynamicElements[elementId];

                    const elementName = `${elementId}$$element`;
                    const elementOriginalId = element.originalId;

                    const tokenSet = Object.values(element.attributes);

                    const externalReferences = Object.keys(tokenSet.reduce<{ [name: string]: any }>((e, i) => {
                        for (const er of i.externalReferences) {
                            e[er] = null;
                        }
                        return e;
                    }, {}))
                        .map(er => { return { name: er }; });

                    funcBody
                        .add(declareVar(elementName)
                            .const
                            .init(makeCall("component.content.getElementById", elementId).build())
                            .build())

                        .add(ts.createIf(
                            ts.createPrefix(ts.SyntaxKind.ExclamationToken, ts.createIdentifier(elementName)),
                            makeThrow(`missing element: @${elementId}`)
                        ));

                    if (elementOriginalId !== undefined) {
                        funcBody
                            .add(ts.createStatement(makeAssignment(`${elementName}.id`, elementOriginalId)));
                    }

                    if (element.events) {
                        for (const eventName in element.events) {
                            if (element.events.hasOwnProperty(eventName)) {
                                const event = element.events[eventName];

                                // document.addEventListener("click", (ev) => {

                                //     const {doClick} = data;
                                //     doClick(ev);

                                //     ev.preventDefault();
                                //     ev.stopPropagation();
                                //     ev.stopImmediatePropagation();
                                // }, { once: true, capture: true, passive: true })

                            }
                        }
                    }


                    funcBody.add(makeCall("autorun", declareFunction()
                        .body(declareObjectDestruction(...externalReferences).const.init(ts.createIdentifier("data")))
                        .body(...tokenSet.map(token => makeCall(elementName + ".setAttribute", token.attributeName, makeTemplateLiteral(token.content)).build()))
                    ).build());
                }
            }

            funcBody.add(ts.createIf(ts.createIdentifier("host"), ts.createStatement(makeCall("host.appendChild", ts.createIdentifier("component.content")).build())))
                .add(ts.createReturn(ts.createIdentifier("component.content")));

            componentFile.componentStatements.add(
                declareFunction(template.id)
                    .param("data")
                    .param("host", null, undefined, "Element")
                    .body(funcBody.build())
                    .export
                    .build());


        }
    }
    return true;
}
