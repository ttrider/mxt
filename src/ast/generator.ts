import * as t from "@babel/types";
import * as g from "@babel/generator";


export function generateFromAst(ast: t.File | t.Program | t.Statement | t.Expression | t.Statement[]) {

    if (t.isExpression(ast)) {
        return g.default(ast, {});
    }
    if (t.isStatement(ast)) {
        return g.default(ast, {});
    }
    if (t.isProgram(ast)) {
        return g.default(ast, {});
    }
    if (t.isFile(ast)) {
        return g.default(ast, {});
    }
    if (Array.isArray(ast)) {
        return g.default(t.program(ast), {});
    }

}