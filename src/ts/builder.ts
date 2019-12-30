import ts from "typescript";

export { Parameter } from "./parameter";
export { TypeNode } from "./type";
export { ArrowFunction, GetAccessor, Call, Return, FunctionDeclaration } from "./function";
export { ForOf } from "./for";
export { StatementList } from "./block";
export { ImportStatement } from "./import";

export { Literal, TemplateLiteral } from "./literal";
export {
    ArrayBinding,
    ArrayBindingVariable,
    Assignment,
    ConstObjectBindingVariable,
    ConstVariable,
    LetObjectBindingVariable,
    LetVariable,
    ObjectBinding,
    ObjectBindingVariable,
    PropertyAssignment,
    Variable,
} from "./declare";


export function generateCode(node: ts.Node) {

    const sf = (!ts.isSourceFile(node)) ? ts.createSourceFile("./dummy.ts", "", ts.ScriptTarget.Latest) : node;

    const printer = ts.createPrinter({ newLine: ts.NewLineKind.LineFeed });
    return printer.printNode(ts.EmitHint.Unspecified, node, sf);

}


