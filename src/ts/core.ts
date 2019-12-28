import ts from "typescript";
export function isExpression(node?: ts.Node): node is ts.Expression {

    return node !== undefined && (
        ts.isArrayLiteralExpression(node)
        || ts.isObjectLiteralExpression(node)
        || ts.isPropertyAccessExpression(node)
        || ts.isElementAccessExpression(node)
        || ts.isCallExpression(node)
        || ts.isNewExpression(node)
        || ts.isTaggedTemplateExpression(node)
        || ts.isParenthesizedExpression(node)
        || ts.isFunctionExpression(node)
        || ts.isDeleteExpression(node)
        || ts.isTypeOfExpression(node)
        || ts.isVoidExpression(node)
        || ts.isAwaitExpression(node)
        || ts.isPrefixUnaryExpression(node)
        || ts.isPostfixUnaryExpression(node)
        || ts.isBinaryExpression(node)
        || ts.isConditionalExpression(node)
        || ts.isTemplateExpression(node)
        || ts.isYieldExpression(node)
        || ts.isClassExpression(node)
        || ts.isOmittedExpression(node)
        || ts.isAsExpression(node)
        || ts.isNonNullExpression(node)
        || ts.isJsxExpression(node)
        || ts.isJSDocTypeExpression(node)
        || ts.isLiteralExpression(node)
        || ts.isCallLikeExpression(node)
        || ts.isCallOrNewExpression(node)
        || ts.isAssertionExpression(node));
}
export function isStatement(node: ts.Node): node is ts.Statement {

    return node !== undefined && (
        ts.isVariableStatement(node)
        || ts.isEmptyStatement(node)
        || ts.isExpressionStatement(node)
        || ts.isIfStatement(node)
        || ts.isDoStatement(node)
        || ts.isWhileStatement(node)
        || ts.isForStatement(node)
        || ts.isForInStatement(node)
        || ts.isForOfStatement(node)
        || ts.isContinueStatement(node)
        || ts.isBreakStatement(node)
        || ts.isBreakOrContinueStatement(node)
        || ts.isReturnStatement(node)
        || ts.isWithStatement(node)
        || ts.isSwitchStatement(node)
        || ts.isLabeledStatement(node)
        || ts.isThrowStatement(node)
        || ts.isTryStatement(node)
        || ts.isDebuggerStatement(node)
    );

}

