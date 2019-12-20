import { HandlerContext, AttributeTokenInfo } from ".";
import { Identifier, arrayPattern, assignmentPattern, sequenceExpression, spreadElement, returnStatement, unaryExpression, throwStatement, newExpression, ifStatement, Statement, nullLiteral, numericLiteral, booleanLiteral, exportNamedDeclaration, tsTypeReference, tsUndefinedKeyword, tsNullKeyword, tsTypeLiteral, tsLiteralType, tsUnionType, exportDefaultDeclaration, tsAnyKeyword, tsTypeAnnotation, tsParameterProperty, tsDeclareFunction, functionDeclaration, expressionStatement, tsModuleBlock, tsModuleDeclaration, blockStatement, templateElement, declareModule, ModuleDeclaration, ImportDeclaration, file, identifier, ExportDeclaration, importSpecifier, importDeclaration, stringLiteral, program, declareVariable, assignmentExpression, callExpression, variableDeclaration, variableDeclarator } from "@babel/types";
import * as t from "@babel/types";
import generate from "@babel/generator";
import { getTemplateLiteral, statementList, declareFunction } from "./code-utils";
import { ComponentFile } from "./component-file";


export function codegen(context: HandlerContext, componentFile: ComponentFile) {

    componentFile.addImport("autorun", "mobx");

    // create definitions code
    for (const templateId in componentFile.templates) {
        if (componentFile.templates.hasOwnProperty(templateId)) {
            const template = componentFile.templates[templateId];

            const constTemplateName = `${template.id}$$template`;

            const templateLiteral = getTemplateLiteral(template.elements);
            if (templateLiteral) {

                componentFile.initStatements.add(
                    makeConstVarByFunc(constTemplateName, "document.createElement", "template"),
                    expressionStatement(assignmentExpression("=", identifier(constTemplateName + ".innerHTML"), templateLiteral)));
            }
        }
    }

    // create init function code
    for (const templateId in componentFile.templates) {
        if (componentFile.templates.hasOwnProperty(templateId)) {
            const template = componentFile.templates[templateId];

            const constTemplateName = `${template.id}$$template`;

            const funcBody = statementList().add(makeConstVarByFunc("component", "document.importNode", identifier(constTemplateName), true));

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


                    funcBody.add(makeConstVarByFunc(elementName, "component.content.getElementById", elementId))
                        .add(ifStatement(unaryExpression("!", identifier(elementName)), makeThrow(`missing element: @${elementId}`)))
                        .add(expressionStatement(assignmentExpression("=", identifier(`${elementName}.id`), stringLiteral(elementOriginalId))))
                        .add(t.expressionStatement(t.callExpression(t.identifier("autorun"), [
                            t.arrowFunctionExpression([], makeAutorunFunction(elementName, tokenSet)
                            )])));
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


function makeAutorunFunction(elementName: string, tokenSet: AttributeTokenInfo[]) {

    const autorunFuncBody: Statement[] = [];

    // consolidate external references
    const externalReferences = Object.keys(tokenSet.reduce<{ [name: string]: any }>((e, i) => {
        for (const er of i.externalReferences) {
            e[er] = null;
        }
        return e;
    }, {})).map(er => identifier(er));

    autorunFuncBody.push(variableDeclaration("const", [
        variableDeclarator(assignmentPattern(t.objectPattern(externalReferences.map(er => t.objectProperty(er, er, undefined, true))), identifier("data")))
    ]));

    for (const token of tokenSet) {
        autorunFuncBody.push(t.expressionStatement(t.callExpression(t.identifier(elementName + ".setAttribute"), [t.stringLiteral(token.attributeName), t.identifier("`" + token.content + "`")])));
    }

    return blockStatement(autorunFuncBody)
}



function makeConstVarByFunc(name: string, funcName: string, ...args: Array<string | number | boolean | Identifier>) {

    return variableDeclaration("const", [
        variableDeclarator(
            identifier(name),
            t.callExpression(
                identifier(funcName),
                args.map(a => {

                    if (typeof a === "string") { return stringLiteral(a) }
                    if (typeof a === "number") { return numericLiteral(a) }
                    if (typeof a === "boolean") { return booleanLiteral(a) }


                    return a;
                })
            ))
    ]);

}

function makeThrow(message: string) {

    return throwStatement(
        newExpression(identifier("Error"), [stringLiteral(message)])
    );
}