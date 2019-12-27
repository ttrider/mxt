
import ts from "typescript";
import { isExpression, isStatement } from "./core";

declare type ArrowFunctionBuilder = ts.ArrowFunction & {
    addParameter: (parameter: ts.ParameterDeclaration) => ArrowFunctionBuilder,
    addBody: (...statement: Array<ts.Statement | ts.Expression>) => ArrowFunctionBuilder,
};

export function ArrowFunction() {
    let obj = ts.createArrowFunction(
        undefined,
        undefined,
        [],
        undefined,
        undefined,
        ts.createBlock([]));

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