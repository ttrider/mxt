import ts from "typescript";

export * from "./block";
export * from "./core";
export * from "./declare";
export * from "./for";
export * from "./function";
export * from "./import";
export * from "./literal";
export * from "./parameter";
export * from "./type";


export function generateCode(node: ts.Node) {

    const sf = (!ts.isSourceFile(node)) ? ts.createSourceFile("./dummy.ts", "", ts.ScriptTarget.Latest) : node;

    const printer = ts.createPrinter({ newLine: ts.NewLineKind.LineFeed });
    return printer.printNode(ts.EmitHint.Unspecified, node, sf);

}


