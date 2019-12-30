import ts, { isBlock } from "typescript";
import { isExpression } from "./core";

export declare type BlockArgs = Array<ts.Statement | ts.Expression | ts.Block | undefined>;


declare type StatementListBuilder = ts.Statement[] & {
    add: (...statement: BlockArgs) => StatementListBuilder;
    toBlock: (multiLine?: boolean | undefined) => ts.Block;

}
export function StatementList(...statement: BlockArgs) {

    const statements: StatementListBuilder = convert(statement) as StatementListBuilder;

    statements.toBlock = (multiLine?: boolean | undefined) => {
        return ts.createBlock(statements, multiLine);
    }

    statements.add = (...statement: BlockArgs) => {
        statements.push(...convert(statement));
        return statements;
    }

    return statements;

    function convert(statements: BlockArgs) {

        return statements.reduce<ts.Statement[]>(
            (ret, item) => {

                if (item !== undefined) {
                    if (isBlock(item)) {
                        ret.push(...item.statements);
                    } else {
                        ret.push(isExpression(item) ? ts.createStatement(item) : item);
                    }
                }
                return ret;
            }, []
        );
    }
}


declare type BlockBuilder = ts.Block & {
    add: (...statement: BlockArgs) => BlockBuilder
};

export function Block(...statement: BlockArgs) {

    let obj = ts.createBlock([], true) as BlockBuilder;
    (obj as any).statements = StatementList(...statement);
    obj.add = (obj as any).statements.add;

    return obj;

}