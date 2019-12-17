import { HandlerContext, ComponentFileInfo } from ".";
import { tsModuleBlock, tsModuleDeclaration, blockStatement, declareModule, ModuleDeclaration, ImportDeclaration, file, identifier, ExportDeclaration, importSpecifier, importDeclaration, stringLiteral, program, declareVariable, assignmentExpression, callExpression, variableDeclaration, variableDeclarator } from "@babel/types";
import { transformSync, ConfigAPI, parse, parseSync, transformFromAstSync } from "@babel/core";
import generate from "@babel/generator";


const tts = require("@babel/plugin-transform-typescript").default;



export function codegen(context: HandlerContext, componentFile: ComponentFileInfo) {


    const body = [

        variableDeclaration("const", [variableDeclarator(identifier("mobx123"), callExpression(identifier("require"), [stringLiteral("mobx")]))]),
        importDeclaration([importSpecifier(identifier("autorun"), identifier("autorun"))], stringLiteral("mobx")),
        variableDeclaration("var", [variableDeclarator(identifier("mobx321"), callExpression(identifier("require"), [stringLiteral("mobx")]))]),

    ];

    const md = declareModule(stringLiteral("foobar"), blockStatement(body), "CommonJS");

    const tsm = tsModuleDeclaration(stringLiteral("tsfoobar"), tsModuleBlock(body));

    const ast = file(program([md, tsm]), "", undefined);


    // const pp = parseSync("var a = 0;", {
    //     filename: "./test",
    //     ast: true,
    //     code: false,
    //     minified: false,
    //     compact: false,
    //     sourceType: "module",

    // });


    // if (pp) {
    //const results = transformFromAstSync(pp, undefined, { plugins: ["@babel/transform-typescript"] })
    const results = transformFromAstSync(ast, undefined, {
        //plugins: ["@babel/transform-typescript"],
        plugins:["@babel/plugin-transform-typescript"],
        presets: ["@babel/preset-typescript"],
        configFile: false,
        babelrc: false,
        code: true,
        ast: true,
        filename: "./testtest.ts"
    });

    if (results) {
        console.info(results.code);
        console.info(results.map);
    }
    //  }

    //transformSync()
    // const tsv = tts(ast);
    // traverse(ast, tsv);



    const gen = generate(ast, {
        
    });
    console.info(gen.code);


    return false;
}