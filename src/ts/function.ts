
import ts, { createIdentifier, CallExpression, NodeArray, Modifier } from "typescript";
import { isExpression, isStatement, fromNodeArray, modifiersBuilder } from "./core";
import { Block, BlockArgs } from "./block";

declare type ArrowFunctionBuilder = ts.ArrowFunction & {
    addParameter: (parameter: ts.ParameterDeclaration) => ArrowFunctionBuilder,
    addBody: (...statement: Array<ts.Statement | ts.Expression>) => ArrowFunctionBuilder,
};
export function ArrowFunction(...statement: Array<ts.Statement | ts.Expression>) {

    let obj = ts.createArrowFunction(
        undefined,
        undefined,
        [],
        undefined,
        undefined,
        mergeConciseBody(ts.createBlock([]), ...statement));

    return update(obj);

    function update(newObj: any): ArrowFunctionBuilder {

        newObj.addBody = addBody;
        newObj.addParameter = addParameter;

        return newObj;
    }

    function addBody(...statement: Array<ts.Statement | ts.Expression>) {

        if (statement.length === 0) return obj;
        return obj = update(ts.updateArrowFunction(obj, obj.modifiers, obj.typeParameters, obj.parameters, obj.type, obj.equalsGreaterThanToken, mergeConciseBody(obj.body, ...statement)));
    }
    function addParameter(...parameter: Array<ts.ParameterDeclaration>) {

        if (parameter.length === 0) return obj;
        return obj = update(ts.updateArrowFunction(obj, obj.modifiers, obj.typeParameters, [...obj.parameters, ...parameter], obj.type, obj.equalsGreaterThanToken, obj.body));
    }
}


declare type FunctionDeclarationBuilder = ts.FunctionDeclaration & {
    addParameter: (...parameter: ts.ParameterDeclaration[]) => FunctionDeclarationBuilder,
    addBody: (...statement: Array<ts.Statement | ts.Expression>) => FunctionDeclarationBuilder,

    readonly export: FunctionDeclarationBuilder,
    readonly async: FunctionDeclarationBuilder,
    // readonly yield: FunctionDeclarationBuilder,

};
export function FunctionDeclaration(name: string, ...statement: Array<ts.Statement | ts.Expression>): FunctionDeclarationBuilder {

    const block = Block(...statement);

    const obj = ts.createFunctionDeclaration(
        undefined,
        undefined,
        undefined,
        name,
        undefined,
        [],
        undefined,
        block) as FunctionDeclarationBuilder;

    obj.modifiers = modifiersBuilder(obj);
    obj.body = block;
    obj.parameters = fromNodeArray(obj.parameters);

    const target = obj as any;
    target.addBody = (...statement: BlockArgs) => {
        block.add(...statement);
        return obj;
    }
    target.addParameter =
        (...parameter: ts.ParameterDeclaration[]) => {
            target.parameters.add(...parameter);
            return obj;
        }

    Object.defineProperty(obj, "export", {
        get() {
            target.modifiers.add(ts.SyntaxKind.ExportKeyword);
            return obj;
        }
    });
    Object.defineProperty(obj, "async", {
        get() {
            target.modifiers.add(ts.SyntaxKind.AsyncKeyword);
            return obj;
        }
    });

    return obj;

    //return update(obj);

    // function update(newObj: any): FunctionDeclarationBuilder {

    //     newObj.addBody = addBody;
    //     newObj.addParameter = addParameter;

    //     Object.defineProperty(newObj, "export", {
    //         get() {
    //             return obj = update(ts.updateFunctionDeclaration(obj, obj.decorators, updateModifiers(obj.modifiers, ts.SyntaxKind.ExportKeyword), obj.asteriskToken, obj.name, obj.typeParameters, obj.parameters, obj.type, obj.body));
    //         }
    //     });
    //     Object.defineProperty(newObj, "async", {
    //         get() {
    //             return obj = update(ts.updateFunctionDeclaration(obj, obj.decorators, updateModifiers(obj.modifiers, ts.SyntaxKind.AsyncKeyword), obj.asteriskToken, obj.name, obj.typeParameters, obj.parameters, obj.type, obj.body));
    //         }
    //     });
    //     Object.defineProperty(newObj, "yield", {
    //         get() {
    //             return obj = update(ts.updateFunctionDeclaration(obj, obj.decorators, obj.modifiers, ts.createToken(ts.SyntaxKind.AsteriskToken), obj.name, obj.typeParameters, obj.parameters, obj.type, obj.body));
    //         }
    //     });

    //     return newObj;
    // }

    // function addBody(...statement: Array<ts.Statement | ts.Expression>) {

    //     if (statement.length === 0) return obj;
    //     return obj = update(ts.updateFunctionDeclaration(obj, obj.decorators, obj.modifiers, obj.asteriskToken, obj.name, obj.typeParameters, obj.parameters, obj.type, Block(obj.body, ...statement)));
    // }
    // function addParameter(...parameter: Array<ts.ParameterDeclaration>) {

    //     if (parameter.length === 0) return obj;
    //     return obj = update(ts.updateFunctionDeclaration(obj, obj.decorators, obj.modifiers, obj.asteriskToken, obj.name, obj.typeParameters, [...obj.parameters, ...parameter], obj.type, Block(obj.body, ...statement)));
    // }
}

declare type GetAccessorDeclarationBuilder = ts.GetAccessorDeclaration & {
    addBody: (...statement: Array<ts.Statement | ts.Expression>) => GetAccessorDeclarationBuilder,
};
export function GetAccessor(name: string, ...statement: Array<ts.Statement | ts.Expression>) {

    let obj = ts.createGetAccessor(
        undefined,
        undefined, name,
        [], undefined,
        Block(...statement));

    return update(obj);

    function update(newObj: any): GetAccessorDeclarationBuilder {

        newObj.addBody = addBody;

        return newObj;
    }

    function addBody(...statement: Array<ts.Statement | ts.Expression>) {

        if (statement.length === 0) return obj;
        return obj = update(ts.updateGetAccessor(obj, obj.decorators, obj.modifiers, obj.name, obj.parameters, obj.type, Block(obj.body, ...statement)));
    }

}

export function Return(expression?: ts.Expression | undefined) {

    let obj = ts.createReturn(expression);

    return obj;
}


declare type CallBuilder = ts.CallExpression & {
    addArg: (...args: Array<string | ts.Expression>) => CallBuilder,
};

export function Call(name: string | ts.Expression, ...args: Array<string | ts.Expression>) {

    if (typeof name === "string") {
        name = ts.createIdentifier(name);
    }
    const a = args.map(item => typeof item === "string" ? ts.createIdentifier(item) : item)

    let obj: CallExpression = ts.createCall(name, [], a);

    return update(obj);

    function update(newObj: any): CallBuilder {

        newObj.addArg = addArg;

        return newObj;
    }

    function addArg(...args: Array<string | ts.Expression>) {

        const a = args.map(item => typeof item === "string" ? ts.createIdentifier(item) : item)

        if (a.length === 0) return obj;
        return obj = update(ts.updateCall(obj, obj.expression, obj.typeArguments, [...obj.arguments, ...a]));
    }
}







function mergeConciseBody(body: ts.ConciseBody, ...statement: Array<ts.Statement | ts.Expression>): ts.ConciseBody {

    if (statement.length === 0) return body;

    const statements: ts.Statement[] = [];

    if (statement.length === 1 && isExpression(statement[0])) {
        // single expression mode
        if (isExpression(body)) {
            // we have existing expression - converting into statements
            statements.push(ts.createStatement(body), ts.createStatement(statement[0]));
        } else {
            if (body.statements.length === 0) {
                // no existring statements
                return statement[0];
            }
            statements.push(...body.statements, ts.createStatement(statement[0]));
        }
    } else {
        if (isExpression(body)) {
            statements.push(ts.createStatement(body));
        } else {
            statements.push(...body.statements);
        }
        statements.push(...statement.map(item => isExpression(item) ? ts.createStatement(item) : item));
    }
    return ts.createBlock(statements, statements.length > 0);
}

function updateModifiers(modifiers: ts.ModifiersArray | undefined, kind:
    ts.SyntaxKind.AbstractKeyword |
    ts.SyntaxKind.AsyncKeyword |
    ts.SyntaxKind.ConstKeyword |
    ts.SyntaxKind.DeclareKeyword |
    ts.SyntaxKind.DefaultKeyword |
    ts.SyntaxKind.ExportKeyword |
    ts.SyntaxKind.PublicKeyword |
    ts.SyntaxKind.PrivateKeyword |
    ts.SyntaxKind.ProtectedKeyword |
    ts.SyntaxKind.ReadonlyKeyword |
    ts.SyntaxKind.StaticKeyword): ts.Modifier[] {

    if (modifiers === undefined) {
        return [ts.createModifier(kind)];
    }

    if (!modifiers.find(t => t.kind === kind)) {
        return [...modifiers, ts.createModifier(kind)];
    }

    return [...modifiers];
}


