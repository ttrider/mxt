import ts, { updateArrayBindingPattern } from "typescript";
import { LiteralArg, Literal } from "./literal";
import { isExpression } from "./core";
import { TypeNodeArgument, TypeNode } from "./type";



export function PropertyAssignment(name: string | ts.Identifier | ts.StringLiteral | ts.NumericLiteral | ts.ComputedPropertyName, value?: Array<LiteralArg> | LiteralArg | ts.Expression | ts.Identifier) {

    return ts.createPropertyAssignment(name, getValueExpression(value));
}

export function Assignment(target: string | ts.Expression, value?: Array<LiteralArg> | LiteralArg | ts.Expression | ts.Identifier) {

    return ts.createAssignment(typeof target === "string" ? ts.createIdentifier(target) : target, getValueExpression(value));
}


declare type ConstVariableBuilder = ts.VariableStatement & {
    setType(type: TypeNodeArgument): ConstVariableBuilder
};
export function ConstVariable(name: string, value?: Array<LiteralArg> | LiteralArg | ts.Expression | ts.Identifier, ...type: Array<TypeNodeArgument>) {
    let init = getValueExpression(value);
    let typeNode = type.length === 0 ? undefined : TypeNode(...type);

    let obj = declareVariable(name, ts.NodeFlags.Const, init, typeNode);

    //const [a, , c, e = 0, ...d] = [0, 1, 2, 3, 4, 5, 6];
    const { a, c: bb, e = 0, ...d } = { a: 0, b: 1, c: 2, d: 3, e: 4, f: 5, g: 6 };


    return update(obj);


    function update(newObj: any): ConstVariableBuilder {

        newObj.setType = (...type: Array<TypeNodeArgument>) => {

            typeNode = TypeNode(...type);

            return obj = update(declareVariable(name, ts.NodeFlags.Const, init, typeNode));
        }
        return newObj;
    }
}

declare type LetVariableBuilder = ts.VariableStatement & {
    setType(type: TypeNodeArgument): LetVariableBuilder
};
export function LetVariable(name: string, value?: Array<LiteralArg> | LiteralArg | ts.Expression | ts.Identifier, ...type: Array<TypeNodeArgument>) {

    let init = getValueExpression(value);
    let typeNode = type.length === 0 ? undefined : TypeNode(...type);

    let obj = declareVariable(name, ts.NodeFlags.Let, init, typeNode);

    return update(obj);

    function update(newObj: any): LetVariableBuilder {

        newObj.setType = (...type: Array<TypeNodeArgument>) => {

            typeNode = TypeNode(...type);

            return obj = update(declareVariable(name, ts.NodeFlags.Let, init, typeNode));
        }
        return newObj;
    }
}



declare type VariableBuilder = ts.VariableStatement & {

    setType(type: TypeNodeArgument): VariableBuilder

    readonly const: VariableBuilder;
    readonly let: VariableBuilder;
    readonly var: VariableBuilder;

};
export function Variable(name: string, value?: Array<LiteralArg> | LiteralArg | ts.Expression | ts.Identifier, ...type: Array<TypeNodeArgument>) {

    let kind: ts.NodeFlags.Let | ts.NodeFlags.Const | undefined = undefined;
    let init = getValueExpression(value);
    let typeNode = type.length === 0 ? undefined : TypeNode(...type);

    let obj = declareVariable(name, kind, init, typeNode);

    return update(obj);

    function update(newObj: any): VariableBuilder {

        newObj.setType = (...type: Array<TypeNodeArgument>) => {

            typeNode = TypeNode(...type);

            return obj = update(declareVariable(name, kind, init, typeNode));
        };


        Object.defineProperty(newObj, "const", {
            get() {
                kind = ts.NodeFlags.Const;
                return obj = update(declareVariable(name, kind, init, typeNode));
            }
        });
        Object.defineProperty(newObj, "let", {
            get() {
                kind = ts.NodeFlags.Let;
                return obj = update(declareVariable(name, kind, init, typeNode));
            }
        });
        Object.defineProperty(newObj, "var", {
            get() {
                kind = undefined;
                return obj = update(declareVariable(name, kind, init, typeNode));
            }
        });

        return newObj;
    }
}

export function ObjectBinding(name: string, params?: { as?: string, dotDotDot?: boolean, defaultValue?: Array<LiteralArg> | LiteralArg | ts.Expression | ts.Identifier }) {

    params = params ?? {};

    return ts.createBindingElement(
        params.dotDotDot ? ts.createToken(ts.SyntaxKind.DotDotDotToken) : undefined,
        params.as ? name : undefined,
        params.as ?? name,
        params.defaultValue ? getValueExpression(params?.defaultValue) : undefined
    )
}

export function ArrayBinding(name?: string, params?: { dotDotDot?: boolean, defaultValue?: Array<LiteralArg> | LiteralArg | ts.Expression | ts.Identifier }) {

    params = params ?? {};
    name = name ?? ";"

    return ts.createBindingElement(
        params.dotDotDot ? ts.createToken(ts.SyntaxKind.DotDotDotToken) : undefined,
        undefined,
        name,
        params.defaultValue ? getValueExpression(params?.defaultValue) : undefined
    )
}

declare type ObjectBindingVariableBuilder = ts.VariableStatement & {
    readonly const: ObjectBindingVariableBuilder;
    readonly let: ObjectBindingVariableBuilder;
    readonly var: ObjectBindingVariableBuilder;
};
export function ObjectBindingVariable(bindings: Array<ts.BindingElement | string>, value: Array<LiteralArg> | LiteralArg | ts.Expression | ts.Identifier) {

    let kind: ts.NodeFlags.Let | ts.NodeFlags.Const | undefined = undefined;
    let init = getValueExpression(value);

    let obj = declareVariable(
        ts.createObjectBindingPattern(
            bindings.map(item => { return typeof item === "string" ? ObjectBinding(item) : item })), kind, init);

    return update(obj);

    function update(newObj: any): ObjectBindingVariableBuilder {

        Object.defineProperty(newObj, "const", {
            get() {
                kind = ts.NodeFlags.Const;
                return obj = update(declareVariable(name, kind, init));
            }
        });
        Object.defineProperty(newObj, "let", {
            get() {
                kind = ts.NodeFlags.Let;
                return obj = update(declareVariable(name, kind, init));
            }
        });
        Object.defineProperty(newObj, "var", {
            get() {
                kind = undefined;
                return obj = update(declareVariable(name, kind, init));
            }
        });

        return newObj;
    }
}
export function ConstObjectBindingVariable(bindings: Array<ts.BindingElement | string>, value: Array<LiteralArg> | LiteralArg | ts.Expression | ts.Identifier) {

    let init = getValueExpression(value);

    let obj = declareVariable(
        ts.createObjectBindingPattern(
            bindings.map(item => { return typeof item === "string" ? ObjectBinding(item) : item })), ts.NodeFlags.Const, init);

    return update(obj);

    function update(newObj: any): ts.VariableStatement {
        return newObj;
    }
}
export function LetObjectBindingVariable(bindings: Array<ts.BindingElement | string>, value: Array<LiteralArg> | LiteralArg | ts.Expression | ts.Identifier) {

    let init = getValueExpression(value);

    let obj = declareVariable(
        ts.createObjectBindingPattern(
            bindings.map(item => { return typeof item === "string" ? ObjectBinding(item) : item })), ts.NodeFlags.Let, init);

    return update(obj);

    function update(newObj: any): ts.VariableStatement {
        return newObj;
    }
}

export function ArrayBindingVariable(bindings: Array<ts.BindingElement | string>, value: Array<LiteralArg> | LiteralArg | ts.Expression | ts.Identifier) {

    let kind: ts.NodeFlags.Let | ts.NodeFlags.Const | undefined = undefined;
    let init = getValueExpression(value);

    let obj = declareVariable(ts.createArrayBindingPattern(
        bindings.map(item => { return typeof item === "string" ? ObjectBinding(item) : item })), kind, init);

    return update(obj);

    function update(newObj: any): VariableBuilder {


        Object.defineProperty(newObj, "const", {
            get() {
                kind = ts.NodeFlags.Const;
                return obj = update(declareVariable(name, kind, init));
            }
        });
        Object.defineProperty(newObj, "let", {
            get() {
                kind = ts.NodeFlags.Let;
                return obj = update(declareVariable(name, kind, init));
            }
        });
        Object.defineProperty(newObj, "var", {
            get() {
                kind = undefined;
                return obj = update(declareVariable(name, kind, init));
            }
        });

        return newObj;
    }
}

function declareVariable(name: string | ts.Identifier | ts.ObjectBindingPattern | ts.ArrayBindingPattern, kind: ts.NodeFlags.Const | ts.NodeFlags.Let | undefined, init?: ts.Expression, typeNode?: ts.TypeNode) {
    return ts.createVariableStatement(
        [],
        ts.createVariableDeclarationList(
            [
                ts.createVariableDeclaration(
                    name,
                    typeNode,
                    init,
                ),
            ],
            kind
        ),
    );
}

function getValueExpression(value?: Array<LiteralArg> | LiteralArg | ts.Expression | ts.Identifier) {
    if (value === undefined) {
        return ts.createIdentifier("undefined");
    }

    if (value === null) {
        return ts.createNull();
    }

    if (ts.isIdentifier(value as any)) {
        return value as ts.Identifier;
    }

    if (isExpression(value as any)) {
        return value as ts.Expression;
    }
    return Literal(value as any);

}