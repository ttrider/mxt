import { HandlerContext, AttributeTokenInfo } from ".";
import { Identifier, arrayPattern, assignmentPattern, sequenceExpression, spreadElement, returnStatement, unaryExpression, throwStatement, newExpression, ifStatement, Statement, nullLiteral, numericLiteral, booleanLiteral, exportNamedDeclaration, tsTypeReference, tsUndefinedKeyword, tsNullKeyword, tsTypeLiteral, tsLiteralType, tsUnionType, exportDefaultDeclaration, tsAnyKeyword, tsTypeAnnotation, tsParameterProperty, tsDeclareFunction, functionDeclaration, expressionStatement, tsModuleBlock, tsModuleDeclaration, blockStatement, templateElement, declareModule, ModuleDeclaration, ImportDeclaration, file, identifier, ExportDeclaration, importSpecifier, importDeclaration, stringLiteral, program, declareVariable, assignmentExpression, callExpression, variableDeclaration, variableDeclarator } from "@babel/types";
import * as t from "@babel/types";
import generate from "@babel/generator";
import { statementList, declareFunction, declareVar, declareObjectDestruction, makeTemplateLiteral, makeAssignment, makeThrow, makeCall } from "./code-utils";
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
                    .init(makeCall("document.createElement", "template").statement)
                    .statement,

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
                    .init(makeCall("document.importNode", t.identifier(constTemplateName), true).statement)
                    .statement
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


                    const af = makeCall("autorun", declareFunction()
                        .body(declareObjectDestruction(...externalReferences).const.init(identifier("data")).statement)
                        .body(...tokenSet.map(token => makeCall(elementName + ".setAttribute", token.attributeName, makeTemplateLiteral(token.content)).statement))
                        .statement);



                    funcBody
                        .add(declareVar(elementName)
                            .const
                            .init(makeCall("component.content.getElementById", elementId).statement)
                            .statement)

                        .add(ifStatement(unaryExpression("!", identifier(elementName)), makeThrow(`missing element: @${elementId}`)))
                        .add(makeAssignment(`${elementName}.id`, elementOriginalId))
                        .add(makeCall("autorun", declareFunction()
                            .body(declareObjectDestruction(...externalReferences).const.init(identifier("data")).statement)
                            .body(...tokenSet.map(token => makeCall(elementName + ".setAttribute", token.attributeName, makeTemplateLiteral(token.content)).statement))
                            .statement).statement)
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
                    .statement);


        }
    }



    const st = componentFile.getStatements();

    const ast = file(program(st), "", undefined);


    const gen = generate(ast, {

    });
    console.info(gen.code);


    return false;
}
