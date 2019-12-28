import ts from "typescript";

//export function Identifier()

declare type LiteralArg = boolean | string | number | RegExp | null | undefined | bigint;

export function Literal(value: Array<LiteralArg> | LiteralArg) {

    if (Array.isArray(value)) {
        return ts.createArrayLiteral(value.map(convertValue));
    }

    return convertValue(value);


    //ts.createLiteralTypeNode()
    // ts.createObjectLiteral
    // ts.createNoSubstitutionTemplateLiteral

    function convertValue(val: LiteralArg) {
        if (val === undefined) {
            return ts.createLiteral(ts.createIdentifier("undefined"));
        }

        if (val === null) {
            return ts.createNull();
        }

        if (typeof val === "boolean" || typeof val === "number") {
            return ts.createLiteral(val);
        }

        if (typeof val === "string") {
            return ts.createStringLiteral(val);
        }

        if (typeof val === "bigint") {
            return ts.createBigIntLiteral(val.toString());
        }

        if (val instanceof RegExp) {
            return ts.createRegularExpressionLiteral(val.source);
        }

        return ts.createLiteral(ts.createIdentifier(val));
    }
}