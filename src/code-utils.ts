import { Element } from "domhandler";
import { getOuterHTML } from "DomUtils";
import { parseSync } from "@babel/core";





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
