import ts from "typescript";
import { LiteralArg, Literal } from "./literal";
import { isExpression } from "./core";


export function Assignment(target: string | ts.Expression, value?: Array<LiteralArg> | LiteralArg | ts.Expression) {

    return ts.createAssignment(typeof target === "string" ? ts.createIdentifier(target) : target, getValueExpression(value));

    function getValueExpression(value?: Array<LiteralArg> | LiteralArg | ts.Expression) {
        if (value === undefined) {
            return ts.createIdentifier("undefined");
        }

        if (value === null) {
            return ts.createNull();
        }

        if (isExpression(value as any)) {
            return value as ts.Expression;
        }
        return Literal(value as any);

    }

}