import ts, { isBlock } from "typescript";
import { isExpression } from "./core";


export declare type BlockArgs = Array<ts.Statement | ts.Expression | ts.Block | undefined>;
declare type BlockBuilder = ts.Block & {
    add: (...statement: Array<ts.Statement | ts.Expression>) => BlockBuilder
};

export function Block(...statement: BlockArgs) {

    let obj = ts.createBlock(convert(statement));

    return update(obj);

    function update(newObj: any): BlockBuilder {

        newObj.add = add;
        return newObj;
    }

    function add(...statement: BlockArgs) {

        if (statement.length === 0) return obj;
        return obj = update(ts.updateBlock(obj, convert([obj, ...statement])));
    }

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