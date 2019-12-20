import { Element } from "domhandler";
import { getOuterHTML } from "DomUtils";
import { parseSync } from "@babel/core";
import * as t from "@babel/types";

export function getTemplateLiteral(literal: string | Element[]) {

    if (typeof literal !== "string") {
        literal = getOuterHTML(literal, { decodeEntities: true, xmlMode: true });
    }

    const statements = parseStatements(literal, true);
    if (statements && statements.length > 0) {
        const statement = statements[0];

        if (statement && statement.type === "ExpressionStatement" && statement.expression.type === "TemplateLiteral") {
            return statement.expression;
        }
    }
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

    const context = {
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

    const parameters: t.Identifier[] = [];
    const body = statementList();
    let kind: "const" | "let" | "var" = "const";
    let initExpression: t.Expression;

    const context = {
        get const() { kind = "const"; return context },
        get let() { kind = "let"; return context },
        get var() { kind = "var"; return context },

        init: addInitValue,

        get statement() { return buildStatement() }
    };

    return context;

    function addInitValue(value: string | number | boolean | null | undefined | t.Expression) {

        if (value === undefined) {
            initExpression = t.identifier("undefined");
            
        } else
        if (value === null) {
            initExpression = t.nullLiteral();
            
        } else
        if (typeof value === "string"){
            initExpression = t.stringLiteral(value);
            
        }else
        if (typeof value === "number"){
            initExpression = t.numericLiteral(value);
            
        }


        return context;
    }

    function buildStatement() {

    }


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



