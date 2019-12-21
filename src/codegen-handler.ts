import { HandlerContext, AttributeTokenInfo } from ".";
import { returnStatement, unaryExpression, ifStatement, expressionStatement, identifier, callExpression } from "@babel/types";
import * as t from "@babel/types";
import { statementList, declareFunction, declareVar, declareObjectDestruction, makeTemplateLiteral, makeAssignment, makeThrow, makeCall } from "./ast/builder";
import { ComponentFile } from "./component-file";


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
                    .init(makeCall("document.createElement", "template").build())
                    .build(),

                makeAssignment(constTemplateName + ".innerHTML", templateLiteral)
            );

        }
    }

    // create init function code
    for (const templateId in componentFile.templates) {
        if (componentFile.templates.hasOwnProperty(templateId)) {
            const template = componentFile.templates[templateId];

            const constTemplateName = `${template.id}$$template`;

            const funcBody = statementList().add(
                declareVar("component")
                    .const
                    .init(makeCall("document.importNode", t.identifier(constTemplateName), true).build())
                    .build()
            );

            const elements = template.tokens.reduce((p, v) => {
                if (p[v.elementId] === undefined) {
                    p[v.elementId] = [v];
                } else {
                    p[v.elementId].push(v);
                }
                return p;
            }, {} as { [elementId: string]: AttributeTokenInfo[] });


            for (const elementId in elements) {
                if (elements.hasOwnProperty(elementId)) {
                    const tokenSet = elements[elementId];
                    const elementOriginalId = tokenSet[0].elementIdOriginal;

                    const elementName = `${elementId}$$element`;

                    const externalReferences = Object.keys(tokenSet.reduce<{ [name: string]: any }>((e, i) => {
                        for (const er of i.externalReferences) {
                            e[er] = null;
                        }
                        return e;
                    }, {})).map(er => { return { name: er }; });





                    funcBody
                        .add(declareVar(elementName)
                            .const
                            .init(makeCall("component.content.getElementById", elementId).build())
                            .build())

                        .add(ifStatement(unaryExpression("!", identifier(elementName)), makeThrow(`missing element: @${elementId}`)))
                        .add(makeAssignment(`${elementName}.id`, elementOriginalId))
                        .add(makeCall("autorun", declareFunction()
                            .body(declareObjectDestruction(...externalReferences).const.init(identifier("data")).build())
                            .body(...tokenSet.map(token => makeCall(elementName + ".setAttribute", token.attributeName, makeTemplateLiteral(token.content)).build()))
                            .build()).build())
                        ;
                }
            }

            funcBody.add(ifStatement(identifier("host"), expressionStatement(callExpression(identifier("host.appendChild"), [identifier("component.content")]))))
                .add(returnStatement(identifier("component.content")));


            componentFile.componentStatements.add(
                declareFunction(template.id)
                    .param("data")
                    .param("host", null, undefined, "Element")
                    .body(funcBody)
                    .export
                    .build());


        }
    }
    return true;
}
