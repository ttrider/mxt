import { Element } from "domhandler";
import { getOuterHTML } from "DomUtils";
import { parseSync } from "@babel/core";
import * as t from "@babel/types";

interface IBuilder {
    build: t.Statement | t.Expression
}

function isBuilder(value: any): value is IBuilder {
    return (value && value.build);
}

export declare type StatementItem =
    t.Statement |
    t.Expression |


    { statements: t.Statement[] }
    ;

export function statementList(statements?: t.Statement[], ...node: Array<StatementItem>) {

    const items = (statements === undefined) ? [] : statements;

    const data =
    {
        statements: items,
        add
    };

    return add(...node);

    function add(...node: Array<StatementItem>) {
        for (let statement of node) {

            if (t.isStatement(statement)) {
                items.push(statement);
            }
            else if (t.isExpression(statement)) {
                items.push(t.expressionStatement(statement));
            }
            else {
                if (statement.statements) {
                    items.push(...statement.statements);
                }
            }

        }

        return data;
    }
}

export function declareFunction(functionName?: string) {

    const parameters: t.Identifier[] = [];
    const body = statementList();
    let isExport = false;

    const context: IBuilder & any = {
        get export() { isExport = true; return context },


        param: addParam,
        body: addStatement,

        get statement() { return buildStatement() }
    };

    return context;

    function buildStatement() {

        // identifiy optional parameters
        let canBeOptional = true;
        for (let i = parameters.length - 1; i >= 0; i--) {
            if (!canBeOptional) {
                parameters[i].optional = false;
            } else {
                if (!parameters[i].optional) {
                    canBeOptional = false;
                }
            }
        }

        if (functionName) {

            const func = t.functionDeclaration(t.identifier(functionName), parameters, t.blockStatement(body.statements));
            if (isExport) {
                return t.exportNamedDeclaration(func, []);
            }
            return func;

        }
        return t.arrowFunctionExpression(parameters, t.blockStatement(body.statements))
    }

    function addStatement(...node: Array<StatementItem>) {
        body.add(...node);
        return context;
    }


    function addParam(name: string, ...types: (null | string | undefined)[]) {

        const i = t.identifier(name);

        if (types.length === 0) {
            i.typeAnnotation = t.tsTypeAnnotation(t.tsAnyKeyword());
        } else if (types.length === 1) {
            i.typeAnnotation = t.tsTypeAnnotation(getType(types[0]));
        } else {
            i.typeAnnotation = t.tsTypeAnnotation(t.tsUnionType(types.map(getType)));
        }

        parameters.push(i);

        return context;

        function getType(tp: null | string | undefined) {

            if (tp === undefined) {
                i.optional = true;
                return (t.tsUndefinedKeyword());
            }

            if (tp === null) {
                return (t.tsNullKeyword());
            }



            return (t.tsTypeReference(t.identifier(tp)));
        }

    }




}

export function declareVar(name: string) {

    let kind: "const" | "let" | "var" = "const";
    let initExpression: t.Expression;

    const context: IBuilder & any = {
        get const() { kind = "const"; return context },
        get let() { kind = "let"; return context },
        get var() { kind = "var"; return context },

        init: addInitValue,

        get statement() { return buildStatement() }
    };

    return context;

    function addInitValue(value: any) {
        initExpression = getValueExpression(value);
        return context;
    }

    function buildStatement() {
        return t.variableDeclaration(kind, [
            t.variableDeclarator(
                t.identifier(name),
                initExpression)
        ]);
    }
}

export function declareObjectDestruction(...props: Array<{ name: string, as?: string }>) {

    let kind: "const" | "let" | "var" = "const";
    let initExpression: t.Expression;
    const properties: Array<{ name: string, as?: string }> = [...props];

    const context: IBuilder & any = {
        get const() { kind = "const"; return context },
        get let() { kind = "let"; return context },
        get var() { kind = "var"; return context },

        property: addProperty,

        init: addInitValue,

        get statement() { return buildStatement() }
    };

    return context;

    function addProperty(name: string, as?: string) {
        properties.push({ name, as });
        return context;
    }

    function addInitValue(value: any) {
        initExpression = getValueExpression(value);
        return context;
    }

    function buildStatement() {

        return t.variableDeclaration(kind, [
            t.variableDeclarator(
                t.assignmentPattern(
                    t.objectPattern(
                        properties.map(er => t.objectProperty(t.identifier(er.name), t.identifier(er.as ? er.as : er.name), undefined, !er.as))),
                    initExpression))
        ]);

    }
}

export function makeCall(name: string, ...params: any[]) {

    const body = statementList();
    const parameters = params.map(getValueExpression);

    const context: IBuilder & any = {
        param: addParam,

        get statement() { return buildStatement() }
    };

    return context;

    function addParam(...params: any[]) {
        parameters.push(...params.map(getValueExpression));
    }

    function buildStatement() {

        return t.callExpression(
            t.identifier(name),
            parameters);
    }

}
export function makeAssignment(target: string, value: any) {
    return t.assignmentExpression("=", t.identifier(target), getValueExpression(value));

}

export function makeTemplateLiteral(literal: string | Element[]) {

    if (typeof literal !== "string") {
        literal = getOuterHTML(literal, { decodeEntities: true, xmlMode: true });
    }
    return t.identifier("`" + literal + "`");
}

export function makeThrow(message: string) {

    return t.throwStatement(
        t.newExpression(t.identifier("Error"), [t.stringLiteral(message)])
    );
}


function parseStatements(code: string, wrapAsTemplate?: boolean) {

    if (wrapAsTemplate) {
        code = "`" + code + "`";
    }

    const results = parseSync(code, {
        babelrc: false,
        configFile: false
    });



    if (results && results.type === "File" && results.program) {
        return results.program.body;
    }

}


function getValueExpression(value?: any) {
    if (value === undefined) {
        return t.identifier("undefined");
    }
    else if (t.isExpression(value)) {
        return value;
    }
    return t.valueToNode(value);
}



