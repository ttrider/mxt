import * as ts from "typescript";


export function dosomething(content: string) {

    const sourceFile = ts.createSourceFile("filename.ts", "const a = `123${b}456`; export function a(){};", ts.ScriptTarget.Latest, false, ts.ScriptKind.TS);





    const printer = ts.createPrinter({ newLine: ts.NewLineKind.LineFeed });

    const result = printer.printNode(ts.EmitHint.Unspecified, sourceFile, sourceFile);

    const rrr = ts.transpile(result, { target: ts.ScriptTarget.ES5, module: ts.ModuleKind.AMD, declaration: true, declarationMap: true, noImplicitAny: false }, sourceFile.fileName, [], "foobarmodule");

    return rrr;
}
