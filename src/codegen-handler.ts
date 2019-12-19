import { HandlerContext, ComponentFileInfo, AttributeTokenInfo } from ".";
import { Identifier, arrayPattern, assignmentPattern, sequenceExpression, spreadElement, returnStatement, unaryExpression, throwStatement, newExpression, ifStatement, Statement, nullLiteral, numericLiteral, booleanLiteral, exportNamedDeclaration, tsTypeReference, tsUndefinedKeyword, tsNullKeyword, tsTypeLiteral, tsLiteralType, tsUnionType, exportDefaultDeclaration, tsAnyKeyword, tsTypeAnnotation, tsParameterProperty, tsDeclareFunction, functionDeclaration, expressionStatement, tsModuleBlock, tsModuleDeclaration, blockStatement, templateElement, declareModule, ModuleDeclaration, ImportDeclaration, file, identifier, ExportDeclaration, importSpecifier, importDeclaration, stringLiteral, program, declareVariable, assignmentExpression, callExpression, variableDeclaration, variableDeclarator } from "@babel/types";
import { transformSync, ConfigAPI, parse, parseSync, transformFromAstSync } from "@babel/core";
import generate from "@babel/generator";
import { getOuterHTML } from "DomUtils";
import { getTemplateLiteral } from "./code-utils";


export function codegen(context: HandlerContext, componentFile: ComponentFileInfo) {

    const body: Statement[] = [
        importDeclaration([importSpecifier(identifier("autorun"), identifier("autorun"))], stringLiteral("mobx")),
    ];

    // create definitions code
    for (const templateId in componentFile.templates) {
        if (componentFile.templates.hasOwnProperty(templateId)) {
            const template = componentFile.templates[templateId];

            const constTemplateName = `${template.id}$$template`;


            const templateLiteral = getTemplateLiteral(template.elements);
            if (templateLiteral) {

                body.push(makeConstVarByFunc(constTemplateName, "document.createElement", "template"));

                body.push(variableDeclaration(
                    "const",
                    [
                        variableDeclarator(
                            identifier(constTemplateName),
                            callExpression(
                                identifier("document.createElement"),
                                [stringLiteral("template")]
                            )
                        )
                    ]
                ));

                body.push(expressionStatement(assignmentExpression("=", identifier(constTemplateName + ".innerHTML"), templateLiteral)));
            }
        }
    }

    // create init function code
    for (const templateId in componentFile.templates) {
        if (componentFile.templates.hasOwnProperty(templateId)) {
            const template = componentFile.templates[templateId];

            const constTemplateName = `${template.id}$$template`;

            const funcBody: Statement[] = [];

            const templateLiteral = getTemplateLiteral(template.elements);
            if (templateLiteral) {

                funcBody.push(makeConstVarByFunc("component", "document.importNode", identifier(constTemplateName), true));

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

                        funcBody.push(variableDeclaration("const", [
                            variableDeclarator(
                                identifier(elementName),
                                callExpression(
                                    identifier("component.content.getElementById"),
                                    [stringLiteral(elementId)]
                                ))
                        ]));

                        funcBody.push(ifStatement(unaryExpression("!", identifier(elementName)), makeThrow(`missing element: @${elementId}`)));
                        funcBody.push(expressionStatement(assignmentExpression("=", identifier(`${elementName}.id`), stringLiteral(elementOriginalId))));
                        funcBody.push(expressionStatement(assignmentExpression("=", identifier(`${elementName}.id$$original`), stringLiteral(""))));


                        funcBody.push(
                            expressionStatement(
                                callExpression(

                                    identifier("host.appendChild"),
                                    [identifier("component.content")]
                                )
                            )
                        );
                        // autorun(() => {
                        //     const { color } = data;
                        //     t01$$01$$el.setAttribute("style", `color: ${color}`);
                        // });



                    }
                }

                funcBody.push(
                    ifStatement(
                        identifier("host"),
                        expressionStatement(callExpression(
                            identifier("host.appendChild"),
                            [identifier("component.content")]
                        ))
                    )
                );

                funcBody.push(returnStatement(identifier("component.content")));


                for (const elementId in elements) {
                    if (elements.hasOwnProperty(elementId)) {
                        const tokenSet = elements[elementId];

                        const autorunFuncBody: Statement[] = [];

                        // consolidate external references
                        const externalReferences = Object.keys(tokenSet.reduce<{ [name: string]: any }>((e, i) => {
                            for (const er of i.externalReferences) {
                                e[er] = null;
                            }
                            return e;
                        }, {})).map(er => identifier(er));

                        //spreadElement(sequenceExpression(externalReferences)),


                        autorunFuncBody.push(variableDeclaration("const", [
                            variableDeclarator(assignmentPattern(arrayPattern(externalReferences), identifier("data")))
                        ]));


                        funcBody.push(
                            functionDeclaration(
                                identifier("dataset"),
                                [
                                ], blockStatement(autorunFuncBody)
                            ));


                    }
                }

                // function declaration
                const func = exportNamedDeclaration(

                    functionDeclaration(
                        identifier(template.id),
                        [
                            makeFunctionParameter("data"),
                            makeFunctionParameter("host", null, undefined, "Element"),
                        ], blockStatement(funcBody)
                    ), []);


                body.push(func);

            }
        }
    }

    const ast = file(program(body), "", undefined);


    const gen = generate(ast, {

    });
    console.info(gen.code);


    return false;
}



function makeFunctionParameter(name: string, ...types: (null | string | undefined)[]) {

    const i = identifier(name);

    if (types.length === 0) {
        i.typeAnnotation = tsTypeAnnotation(tsAnyKeyword());
    } else if (types.length === 1) {
        i.typeAnnotation = tsTypeAnnotation(getType(types[0]));
    } else {
        i.typeAnnotation = tsTypeAnnotation(tsUnionType(types.map(getType)));
    }

    return i;

    function getType(tp: null | string | undefined) {

        if (tp === undefined) {
            return (tsUndefinedKeyword());
        }

        if (tp === null) {
            return (tsNullKeyword());
        }



        return (tsTypeReference(identifier(tp)));
    }

}

function makeConstVarByFunc(name: string, funcName: string, ...args: Array<string | number | boolean | Identifier>) {

    return variableDeclaration("const", [
        variableDeclarator(
            identifier(name),
            callExpression(
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