"use strict";
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (Object.hasOwnProperty.call(mod, k)) result[k] = mod[k];
    result["default"] = mod;
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
const DomUtils_1 = require("DomUtils");
const t = __importStar(require("@babel/types"));
function isBuilder(value) {
    return (value && value.build);
}
function statementList(statements, ...node) {
    const items = (statements === undefined) ? [] : statements;
    const data = {
        statements: items,
        add
    };
    return add(...node);
    function add(...node) {
        for (let statement of node) {
            if (isBuilder(statement)) {
                statement = statement.build();
            }
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
exports.statementList = statementList;
function declareFunction(functionName) {
    const parameters = [];
    const body = statementList();
    let isExport = false;
    const context = {
        get export() { isExport = true; return context; },
        param: addParam,
        body: addStatement,
        build: buildStatement
    };
    return context;
    function buildStatement() {
        // identifiy optional parameters
        let canBeOptional = true;
        for (let i = parameters.length - 1; i >= 0; i--) {
            if (!canBeOptional) {
                parameters[i].optional = false;
            }
            else {
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
        return t.arrowFunctionExpression(parameters, t.blockStatement(body.statements));
    }
    function addStatement(...node) {
        body.add(...node);
        return context;
    }
    function addParam(name, ...types) {
        const i = t.identifier(name);
        if (types.length === 0) {
            i.typeAnnotation = t.tsTypeAnnotation(t.tsAnyKeyword());
        }
        else if (types.length === 1) {
            i.typeAnnotation = t.tsTypeAnnotation(getType(types[0]));
        }
        else {
            i.typeAnnotation = t.tsTypeAnnotation(t.tsUnionType(types.map(getType)));
        }
        parameters.push(i);
        return context;
        function getType(tp) {
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
exports.declareFunction = declareFunction;
function declareVar(name) {
    let kind = "const";
    let initExpression;
    const context = {
        get const() { kind = "const"; return context; },
        get let() { kind = "let"; return context; },
        get var() { kind = "var"; return context; },
        init: addInitValue,
        build: buildStatement
    };
    return context;
    function addInitValue(value) {
        initExpression = getValueExpression(value);
        return context;
    }
    function buildStatement() {
        return t.variableDeclaration(kind, [
            t.variableDeclarator(t.identifier(name), initExpression)
        ]);
    }
}
exports.declareVar = declareVar;
function declareObjectDestruction(...props) {
    let kind = "const";
    let initExpression;
    const properties = [...props];
    const context = {
        get const() { kind = "const"; return context; },
        get let() { kind = "let"; return context; },
        get var() { kind = "var"; return context; },
        property: addProperty,
        init: addInitValue,
        build: buildStatement
    };
    return context;
    function addProperty(name, as) {
        properties.push({ name, as });
        return context;
    }
    function addInitValue(value) {
        initExpression = getValueExpression(value);
        return context;
    }
    function buildStatement() {
        return t.variableDeclaration(kind, [
            t.variableDeclarator(t.assignmentPattern(t.objectPattern(properties.map(er => t.objectProperty(t.identifier(er.name), t.identifier(er.as ? er.as : er.name), undefined, !er.as))), initExpression))
        ]);
    }
}
exports.declareObjectDestruction = declareObjectDestruction;
function makeCall(name, ...params) {
    const parameters = params.map(getValueExpression);
    const context = {
        param: addParam,
        build: buildStatement
    };
    return context;
    function addParam(...params) {
        parameters.push(...params.map(getValueExpression));
    }
    function buildStatement() {
        return t.callExpression(t.identifier(name), parameters);
    }
}
exports.makeCall = makeCall;
function makeAssignment(target, value) {
    return t.assignmentExpression("=", t.identifier(target), getValueExpression(value));
}
exports.makeAssignment = makeAssignment;
function makeTemplateLiteral(literal) {
    if (typeof literal !== "string") {
        literal = DomUtils_1.getOuterHTML(literal, { decodeEntities: true, xmlMode: true });
    }
    return t.identifier("`" + literal + "`");
}
exports.makeTemplateLiteral = makeTemplateLiteral;
function makeThrow(message) {
    return t.throwStatement(t.newExpression(t.identifier("Error"), [t.stringLiteral(message)]));
}
exports.makeThrow = makeThrow;
function getValueExpression(value) {
    if (value === undefined) {
        return t.identifier("undefined");
    }
    if (isBuilder(value)) {
        value = value.build();
    }
    else if (t.isExpression(value)) {
        return value;
    }
    return t.valueToNode(value);
}
//# sourceMappingURL=builder.js.map