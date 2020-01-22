import ts from "typescript";
import { PropertyAssignment } from "./declare";

//export function Identifier()

export declare type LiteralArg = boolean | string | number | RegExp | null | undefined | bigint;

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

export function TemplateLiteral(content: string) {

    return ts.createIdentifier("`" + content.replace("`", "\`") + "`");
}


declare type ObjectLiteralBuilder = ts.ObjectLiteralExpression & {
    addProperty: (name: string | ts.Identifier | ts.StringLiteral | ts.NumericLiteral | ts.ComputedPropertyName, value?: Array<LiteralArg> | LiteralArg | ts.Expression | ts.Identifier) => ObjectLiteralBuilder,

};
export function ObjectLiteral(properties?: readonly ts.ObjectLiteralElementLike[] | undefined) {

    let obj = ts.createObjectLiteral(properties);

    (obj as any).multiLine = properties && properties.length > 1;


    return update(obj);

    function update(newObj: any): ObjectLiteralBuilder {

        newObj.addProperty = (name: string | ts.Identifier | ts.StringLiteral | ts.NumericLiteral | ts.ComputedPropertyName, value?: Array<LiteralArg> | LiteralArg | ts.Expression | ts.Identifier) => {

            newObj.properties.push(PropertyAssignment(name, value));

            newObj.multiLine = newObj.properties && newObj.properties.length > 1;

            return newObj;
        };

        return newObj;
    }

}
