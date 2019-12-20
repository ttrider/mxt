"use strict";
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (Object.hasOwnProperty.call(mod, k)) result[k] = mod[k];
    result["default"] = mod;
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
const t = __importStar(require("@babel/types"));
const g = __importStar(require("@babel/generator"));
function generateFromAst(ast) {
    if (t.isExpression(ast)) {
        return g.default(ast, {});
    }
    if (t.isStatement(ast)) {
        return g.default(ast, {});
    }
    if (t.isProgram(ast)) {
        return g.default(ast, {});
    }
    if (t.isFile(ast)) {
        return g.default(ast, {});
    }
    if (Array.isArray(ast)) {
        return g.default(t.program(ast), {});
    }
}
exports.generateFromAst = generateFromAst;
//# sourceMappingURL=generator.js.map