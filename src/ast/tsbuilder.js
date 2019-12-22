"use strict";
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (Object.hasOwnProperty.call(mod, k)) result[k] = mod[k];
    result["default"] = mod;
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
const ts = __importStar(require("typescript"));
function dosomething(content) {
    const sourceFile = ts.createSourceFile("filename.ts", "const a = `123${b}456`; export function a(){};", ts.ScriptTarget.Latest, false, ts.ScriptKind.TS);
    const printer = ts.createPrinter({ newLine: ts.NewLineKind.LineFeed });
    const result = printer.printNode(ts.EmitHint.Unspecified, sourceFile, sourceFile);
    const rrr = ts.transpile(result, { target: ts.ScriptTarget.ES5, module: ts.ModuleKind.AMD, declaration: true, declarationMap: true, noImplicitAny: false }, sourceFile.fileName, [], "foobarmodule");
    return rrr;
}
exports.dosomething = dosomething;
//# sourceMappingURL=tsbuilder.js.map