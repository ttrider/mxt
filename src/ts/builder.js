"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const typescript_1 = __importDefault(require("typescript"));
const DomUtils_1 = require("DomUtils");
function isBuilder(value) {
    return (value && value.build);
}
function isExpression(value) {
    return (value && value._expressionBrand !== undefined);
}
exports.isExpression = isExpression;
function isStatement(value) {
    return (value && value._statementBrand !== undefined);
}
exports.isStatement = isStatement;
function importStatement(from, name) {
    const importMembers = [];
    const context = {
        importMember: (name, as) => {
            importMembers.push({ name, as });
            return context;
        },
        build: buildStatement
    };
    return context;
    function buildStatement() {
        const specifiers = importMembers
            .map(m => {
            if (m.as === undefined || m.as === m.name) {
                return typescript_1.default.createImportSpecifier(undefined, typescript_1.default.createIdentifier(m.name));
            }
            return typescript_1.default.createImportSpecifier(typescript_1.default.createIdentifier(m.name), typescript_1.default.createIdentifier(m.as));
        });
        const cl = typescript_1.default.createImportClause(name === undefined
            ? undefined
            : typescript_1.default.createIdentifier(name), specifiers.length > 0 ? typescript_1.default.createNamedImports(specifiers) : undefined);
        const id = typescript_1.default.createImportDeclaration([], [], cl, typescript_1.default.createStringLiteral(from));
        return id;
    }
}
exports.importStatement = importStatement;
function statements(...node) {
    const items = [];
    const context = {
        add,
        build: buildStatement
    };
    return add(...node);
    function add(...node) {
        for (const statement of node) {
            const st = Array.isArray(statement) ? statement : [statement];
            for (let item of st) {
                if (isBuilder(item)) {
                    item = item.build();
                }
                if (isExpression(item)) {
                    item = typescript_1.default.createStatement(item);
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
exports.statements = statements;
function declareFunction(functionName) {
    const parameters = [];
    const body = statements();
    let isExport = false;
    const context = {
        get export() { isExport = true; return context; },
        param: addParam,
        body: (...node) => {
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
            }
            else {
                if (!parameters[i].questionToken) {
                    canBeOptional = false;
                }
            }
        }
        if (functionName) {
            const modifiers = isExport ? [typescript_1.default.createToken(typescript_1.default.SyntaxKind.ExportKeyword)] : [];
            return typescript_1.default.createFunctionDeclaration([], modifiers, undefined, functionName, undefined, parameters, undefined, typescript_1.default.createBlock(body.build(), true));
        }
        else {
            return typescript_1.default.createArrowFunction(undefined, undefined, parameters, undefined, undefined, typescript_1.default.createBlock(body.build(), true));
        }
    }
    function addParam(name, ...types) {
        const parameter = typescript_1.default.createParameter([], [], undefined, name);
        if (types.length === 0) {
            parameter.type = typescript_1.default.createTypeReferenceNode("any", undefined);
        }
        else if (types.length === 1) {
            parameter.type = getType(types[0]);
        }
        else {
            parameter.type = typescript_1.default.createUnionTypeNode(types.map(getType));
        }
        parameters.push(parameter);
        return context;
        function getType(tp) {
            if (tp === undefined) {
                parameter.questionToken = typescript_1.default.createToken(typescript_1.default.SyntaxKind.QuestionToken);
                return typescript_1.default.createTypeReferenceNode("undefined", undefined);
            }
            if (tp === null) {
                return (typescript_1.default.createNull());
            }
            return typescript_1.default.createTypeReferenceNode(tp, undefined);
        }
    }
}
exports.declareFunction = declareFunction;
function declareVar(name) {
    let kind = typescript_1.default.NodeFlags.Const;
    let initExpression;
    const context = {
        get const() { kind = typescript_1.default.NodeFlags.Const; return context; },
        get let() { kind = typescript_1.default.NodeFlags.Let; return context; },
        get var() { kind = undefined; return context; },
        init: (value) => {
            initExpression = getValueExpression(value);
            return context;
        },
        build: buildStatement
    };
    return context;
    function buildStatement() {
        return typescript_1.default.createVariableStatement([], typescript_1.default.createVariableDeclarationList([
            typescript_1.default.createVariableDeclaration(name, undefined, initExpression),
        ], kind));
    }
}
exports.declareVar = declareVar;
function declareObjectDestruction(...props) {
    let kind = typescript_1.default.NodeFlags.Const;
    let initExpression;
    const properties = [...props];
    const context = {
        get const() { kind = typescript_1.default.NodeFlags.Const; return context; },
        get let() { kind = typescript_1.default.NodeFlags.Let; return context; },
        get var() { kind = undefined; return context; },
        property: (name, as) => {
            properties.push({ name, as });
            return context;
        },
        init: (value) => {
            initExpression = getValueExpression(value);
            return context;
        },
        build: buildStatement
    };
    return context;
    function buildStatement() {
        return typescript_1.default.createVariableStatement([], typescript_1.default.createVariableDeclarationList([
            typescript_1.default.createVariableDeclaration(typescript_1.default.createObjectBindingPattern(properties.map(item => {
                if (item.as === undefined) {
                    return typescript_1.default.createBindingElement(undefined, undefined, item.name);
                }
                return typescript_1.default.createBindingElement(undefined, item.name, item.as);
            })), undefined, initExpression),
        ], kind));
    }
}
exports.declareObjectDestruction = declareObjectDestruction;
function makeCall(name, ...params) {
    const parameters = params.map(getValueExpression);
    const context = {
        param: (...params) => {
            parameters.push(...params.map(getValueExpression));
        },
        build: buildStatement
    };
    return context;
    function buildStatement() {
        return typescript_1.default.createCall(typescript_1.default.createIdentifier(name), undefined, parameters);
    }
}
exports.makeCall = makeCall;
function makeAssignment(target, value) {
    return typescript_1.default.createAssignment(typescript_1.default.createIdentifier(target), getValueExpression(value));
}
exports.makeAssignment = makeAssignment;
function makeTemplateLiteral(literal) {
    if (typeof literal !== "string") {
        literal = DomUtils_1.getOuterHTML(literal, { decodeEntities: true, xmlMode: true });
    }
    return typescript_1.default.createIdentifier("`" + literal + "`");
}
exports.makeTemplateLiteral = makeTemplateLiteral;
function makeThrow(message) {
    return typescript_1.default.createThrow(typescript_1.default.createNew(typescript_1.default.createIdentifier("Error"), undefined, [typescript_1.default.createStringLiteral(message)]));
}
exports.makeThrow = makeThrow;
function getValueExpression(value) {
    if (value === undefined) {
        return typescript_1.default.createIdentifier("undefined");
    }
    if (value === null) {
        return typescript_1.default.createNull();
    }
    if (isBuilder(value)) {
        value = value.build();
    }
    if (value.kind !== undefined) {
        return value;
    }
    return typescript_1.default.createLiteral(value);
}
function generateCode(node) {
    const sf = (!typescript_1.default.isSourceFile(node)) ? typescript_1.default.createSourceFile("./dummy.ts", "", typescript_1.default.ScriptTarget.Latest) : node;
    const printer = typescript_1.default.createPrinter({ newLine: typescript_1.default.NewLineKind.LineFeed });
    return printer.printNode(typescript_1.default.EmitHint.Unspecified, node, sf);
}
exports.generateCode = generateCode;
//# sourceMappingURL=builder.js.map