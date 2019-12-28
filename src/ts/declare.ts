import ts, { updateArrayBindingPattern } from "typescript";
import { LiteralArg, Literal } from "./literal";
import { isExpression } from "./core";
import { TypeNodeArgument, TypeNode } from "./type";


export function Assignment(target: string | ts.Expression, value?: Array<LiteralArg> | LiteralArg | ts.Expression | ts.Identifier) {

    return ts.createAssignment(typeof target === "string" ? ts.createIdentifier(target) : target, getValueExpression(value));
}

declare type VariableBuilder = ts.VariableStatement & {

    setType(type: TypeNodeArgument): VariableBuilder

    readonly const: VariableBuilder;
    readonly let: VariableBuilder;
    readonly var: VariableBuilder;

};

declare type ConstVariableBuilder = ts.VariableStatement & {
    setType(type: TypeNodeArgument): ConstVariableBuilder
};
declare type LetVariableBuilder = ts.VariableStatement & {
    setType(type: TypeNodeArgument): LetVariableBuilder
};


export function ConstVariable(name: string, value?: Array<LiteralArg> | LiteralArg | ts.Expression | ts.Identifier, ...type: Array<TypeNodeArgument>) {
    let init = getValueExpression(value);
    let typeNode = type.length === 0 ? undefined : TypeNode(...type);

    let obj = declareVariable(name, ts.NodeFlags.Const, init, typeNode);

    return update(obj);

    function update(newObj: any): ConstVariableBuilder {

        newObj.setType = (...type: Array<TypeNodeArgument>) => {

            typeNode = TypeNode(...type);

            return obj = update(declareVariable(name, ts.NodeFlags.Const, init, typeNode));
        }
        return newObj;
    }
}
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


export function Variable(name: string, value?: Array<LiteralArg> | LiteralArg | ts.Expression | ts.Identifier, ...type: Array<TypeNodeArgument>) {

    let kind: ts.NodeFlags.Let | ts.NodeFlags.Const | undefined = undefined;
    let init = getValueExpression(value);
    let typeNode = type.length === 0 ? undefined : TypeNode(...type);

    let obj = declareVariable(name, kind, init, typeNode);

    return update(obj);



    function update(newObj: any): VariableBuilder {

        newObj.setType = (...type: Array<TypeNodeArgument>) => {

            typeNode = TypeNode(...type);

            return obj = update(ts.updateVariableStatement(obj, obj.modifiers, ts.createVariableDeclarationList(
                [
                    ts.createVariableDeclaration(
                        name,
                        typeNode,
                        getValueExpression(value),
                    ),
                ],
                ts.NodeFlags.Const
            )));
        },


            Object.defineProperty(
                newObj,
                "const",
                {
                    get() {
                        return obj = update(ts.updateVariableStatement(obj, obj.modifiers, ts.createVariableDeclarationList(
                            [
                                ts.createVariableDeclaration(
                                    name,
                                    typeNode,
                                    getValueExpression(value),
                                ),
                            ],
                            ts.NodeFlags.Const
                        )));
                    }
                }
            );
        Object.defineProperty(
            newObj,
            "let",
            {
                get() {
                    return obj = update(ts.updateVariableStatement(obj, obj.modifiers, ts.createVariableDeclarationList(
                        [
                            ts.createVariableDeclaration(
                                name,
                                typeNode,
                                getValueExpression(value),
                            ),
                        ],
                        ts.NodeFlags.Let
                    )));
                }
            }
        );
        Object.defineProperty(
            newObj,
            "var",
            {
                get() {
                    return obj = update(ts.updateVariableStatement(obj, obj.modifiers, ts.createVariableDeclarationList(
                        [
                            ts.createVariableDeclaration(
                                name,
                                typeNode,
                                getValueExpression(value),
                            ),
                        ],
                        undefined
                    )));
                }
            }
        );

        return newObj;
    }
}

function declareVariable(name: string, kind: ts.NodeFlags.Const | ts.NodeFlags.Let | undefined, init?: ts.Expression, typeNode?: ts.TypeNode) {
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