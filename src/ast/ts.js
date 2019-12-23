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
function parseInlineExpressions(content) {
    const state = {
        content,
        hasTokens: false,
        externalReferences: []
    };
    const code = "`" + content + "`";
    const result = getDiagnosticsForText(code);
    if (result) {
        state.hasTokens = true;
        state.externalReferences =
            result
                .filter(r => r.code === 2304)
                .map(r => code.substr(r.start === undefined ? 0 : r.start, r.length));
    }
    return state;
}
exports.parseInlineExpressions = parseInlineExpressions;
;
function getDiagnosticsForText(text) {
    const dummyFilePath = "/file.ts";
    const textAst = ts.createSourceFile(dummyFilePath, text, ts.ScriptTarget.Latest);
    const ht = hasTokens(textAst);
    if (ht) {
        const options = {};
        const host = {
            fileExists: filePath => filePath === dummyFilePath,
            directoryExists: dirPath => dirPath === "/",
            getCurrentDirectory: () => "/",
            getDirectories: () => [],
            getCanonicalFileName: fileName => fileName,
            getNewLine: () => "\n",
            getDefaultLibFileName: () => "",
            getSourceFile: filePath => filePath === dummyFilePath ? textAst : undefined,
            readFile: filePath => filePath === dummyFilePath ? text : undefined,
            useCaseSensitiveFileNames: () => true,
            writeFile: () => { }
        };
        const program = ts.createProgram({
            options,
            rootNames: [dummyFilePath],
            host
        });
        return ts.getPreEmitDiagnostics(program);
    }
}
function hasTokens(node) {
    let value = false;
    traverse(node);
    return value;
    function traverse(node) {
        if (ts.isTemplateSpan(node)) {
            value = true;
            return;
        }
        ts.forEachChild(node, traverse);
    }
}
//# sourceMappingURL=ts.js.map