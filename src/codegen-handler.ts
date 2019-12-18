import { HandlerContext, ComponentFileInfo } from ".";
import { Statement, expressionStatement, tsModuleBlock, tsModuleDeclaration, blockStatement, templateElement, declareModule, ModuleDeclaration, ImportDeclaration, file, identifier, ExportDeclaration, importSpecifier, importDeclaration, stringLiteral, program, declareVariable, assignmentExpression, callExpression, variableDeclaration, variableDeclarator } from "@babel/types";
import { transformSync, ConfigAPI, parse, parseSync, transformFromAstSync } from "@babel/core";
import generate from "@babel/generator";
import { getOuterHTML } from "DomUtils";
import { getTemplateLiteral } from "./code-utils";


export function codegen(context: HandlerContext, componentFile: ComponentFileInfo) {

    const body: Statement[] = [
        importDeclaration([importSpecifier(identifier("autorun"), identifier("autorun"))], stringLiteral("mobx")),
    ];


    for (const templateId in componentFile.templates) {
        if (componentFile.templates.hasOwnProperty(templateId)) {
            const template = componentFile.templates[templateId];

            const constTemplateName = `${template.id}$$template`;


            const templateLiteral = getTemplateLiteral(template.elements);
            if (templateLiteral) {
                //body.push(variableDeclaration("const", [variableDeclarator(identifier(`${template.id}$$template`), templateLiteral)]));

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

                body.push(expressionStatement(assignmentExpression("=", identifier(constTemplateName+".innerHTML"), templateLiteral)));
            }
        }
    }

    const ast = file(program(body), "", undefined);


    const gen = generate(ast, {

    });
    console.info(gen.code);


    return false;
}