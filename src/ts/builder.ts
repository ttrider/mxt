import ts from "typescript";






export function importStatement(from: string, name?: string) {

    const importMembers: Array<{ name: string, as?: string }> = [];

    const context = {

        importMember: (name: string, as?: string) => {
            importMembers.push({ name, as });
            return context;
        },

        build: buildStatement
    };

    return context;

    function buildStatement() {

        const specifiers = importMembers
            .map(m => {

                if (m.as === undefined) {
                    return ts.createImportSpecifier(undefined, ts.createIdentifier(m.name));
                }
                return ts.createImportSpecifier(ts.createIdentifier(m.name), ts.createIdentifier(m.as));
            });

        const cl = ts.createImportClause(
            name === undefined
                ? undefined
                : ts.createIdentifier(name),
            specifiers.length > 0 ? ts.createNamedImports(specifiers) : undefined);

        const id = ts.createImportDeclaration([], [], cl, ts.createStringLiteral(from));

        return id;
    }
}


interface IBuilder {
    build(): ts.Statement
}

function isBuilder(value: any): value is IBuilder {
    return (value && value.build);
}

export declare type StatementItem =
    ts.Statement |
    IBuilder
    ;


export function statements(...node: Array<StatementItem | StatementItem[]>) {

    const items: ts.Statement[] = [];

    const context =
    {
        add,

        build: buildStatement
    };

    return add(...node);

    function add(...node: Array<StatementItem | StatementItem[]>) {
        for (const statement of node) {

            const st = Array.isArray(statement) ? statement : [statement];

            for (let item of st) {
                if (isBuilder(item)) {
                    item = item.build();
                }
                items.push(item);
            }
        }
        return context;
    }

    function buildStatement() {
        return items;
    }
}

export function declareFunction(functionName?: string) {

    const parameters: ts.ParameterDeclaration[] = [];
    const body = statements();
    let isExport = false;

    const context = {
        get export() { isExport = true; return context },


        param: addParam,
        body: (...node: Array<StatementItem | StatementItem[]>) => {
            body.add(...node);
            return context;
        },

        build: buildStatement
    };

    return context;

    function buildStatement() {

        // identifiy optional parameters
        let canBeOptional = true;
        for (let i = parameters.length - 1; i >= 0; i--) {
            if (!canBeOptional) {
                parameters[i].questionToken = undefined;
            } else {
                if (!parameters[i].questionToken) {
                    canBeOptional = false;
                }
            }
        }


        if (functionName) {
            const modifiers = isExport ? [ts.createToken(ts.SyntaxKind.ExportKeyword)] : [];
            return ts.createFunctionDeclaration([], modifiers, undefined, functionName, undefined, parameters, undefined, ts.createBlock([]));
        } else {
            return ts.createArrowFunction(undefined, undefined, parameters, undefined, undefined, ts.createBlock([]));
        }
    }

    function addParam(name: string, ...types: (null | string | undefined)[]) {

        const parameter = ts.createParameter(
            [],
            [],
            undefined,
            name,
        );

        if (types.length === 0) {
            parameter.type = ts.createTypeReferenceNode("any", undefined);
        } else if (types.length === 1) {
            parameter.type = getType(types[0]);
        } else {
            parameter.type = ts.createUnionTypeNode(types.map(getType));
        }

        parameters.push(parameter);

        return context;

        function getType(tp: null | string | undefined) {

            if (tp === undefined) {
                parameter.questionToken = ts.createToken(ts.SyntaxKind.QuestionToken);
                return ts.createTypeReferenceNode("undefined", undefined)
            }

            if (tp === null) {
                return (ts.createNull());
            }

            return ts.createTypeReferenceNode(tp, undefined);
        }
    }
}

export function declareVar(name: string) {

    let kind: ts.NodeFlags.Const | ts.NodeFlags.Let | undefined = ts.NodeFlags.Const;
    let initExpression: ts.Expression;

    const context = {
        get const() { kind = ts.NodeFlags.Const; return context },
        get let() { kind = ts.NodeFlags.Let; return context },
        get var() { kind = undefined; return context },

        init: (value: any) => {
            initExpression = getValueExpression(value);
            return context;
        },

        build: buildStatement
    };

    return context;

    function buildStatement() {

        return ts.createVariableStatement(
            [],
            ts.createVariableDeclarationList(
                [
                    ts.createVariableDeclaration(
                        name,
                        undefined,
                        initExpression,
                    ),
                ],
                kind
            ),
        )

    }
}




function getValueExpression(value?: any) {
    if (value === undefined) {
        return ts.createIdentifier("undefined");
    }

    if (value === null) {
        return ts.createNull();
    }

    if (isBuilder(value)) {
        value = value.build();
    }

    if (value.kind !== undefined) {
        return value;
    }

    return ts.createLiteral(value)

}

export function generateCode(node: ts.Node) {

    const sf = (!ts.isSourceFile(node)) ? ts.createSourceFile("./dummy.ts", "", ts.ScriptTarget.Latest) : node;

    const printer = ts.createPrinter({ newLine: ts.NewLineKind.LineFeed });
    return printer.printNode(ts.EmitHint.Unspecified, node, sf);

}