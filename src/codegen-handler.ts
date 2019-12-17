import { HandlerContext, ComponentFileInfo } from ".";
import { ModuleDeclaration, ImportDeclaration, identifier, importSpecifier, importDeclaration, stringLiteral, program, declareVariable, assignmentExpression, callExpression, variableDeclaration, variableDeclarator } from "babel-types";
import generate from "babel-generator";


export function codegen(context: HandlerContext, componentFile: ComponentFileInfo) {

    const body = [

        variableDeclaration("var", [variableDeclarator(identifier("mobx"),callExpression(identifier("require"), [stringLiteral("mobx")]))]),

        importDeclaration([importSpecifier(identifier("autorun"), identifier("autorun"))], stringLiteral("mobx")),
    ];

    const ast = program(body);

    const results = generate(ast, {
        sourceMaps: true
    });

    console.info(results.code);
    console.info(results.map);

    return false;
}