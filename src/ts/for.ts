import ts from "typescript";
import { Block, BlockArgs } from "./block";


declare type ForOfStatementBuilder = ts.ForOfStatement & {
    addBody: (...statement: Array<ts.Statement | ts.Expression>) => ForOfStatementBuilder,
};

export function ForOf(variable: string | ts.Identifier, of: string | ts.Expression, ...statement: BlockArgs) {


    let obj = ts.createForOf(
        undefined,
        ts.createVariableDeclarationList(
            [ts.createVariableDeclaration(variable)],
            ts.NodeFlags.Const),
        typeof of === "string" ? ts.createIdentifier(of) : of,
        Block(...statement));

    return update(obj);

    function update(newObj: any): ForOfStatementBuilder {

        newObj.addBody = addBody;
        return newObj;
    }

    function addBody(...statement: Array<ts.Statement | ts.Expression>) {

        if (statement.length === 0) return obj;
        return obj = update(ts.updateForOf(obj, obj.awaitModifier, obj.initializer, obj.expression, Block(obj.statement, ...statement)));
    }

}