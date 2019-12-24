import * as ts from "typescript";
import { ExpressionInfo } from "..";

export function parseInlineExpressions(content: string) {

    const state: ExpressionInfo = {
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

function getDiagnosticsForText(text: string) {
    const dummyFilePath = "/file.ts";
    const textAst = ts.createSourceFile(dummyFilePath, text, ts.ScriptTarget.Latest);

    const ht = hasTokens(textAst);

    if (ht) {

        const options: ts.CompilerOptions = {};
        const host: ts.CompilerHost = {
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

function hasTokens(node: ts.Node) {

    let value = false;
    traverse(node);
    return value;
    function traverse(node: ts.Node) {
        if (ts.isTemplateSpan(node)) {
            value = true;
            return;
        }
        ts.forEachChild(node, traverse);
    }
}

export function generateCode(node: ts.Node | ts.Statement[]) {

    const printer = ts.createPrinter({ newLine: ts.NewLineKind.LineFeed });

    if (Array.isArray(node)) {

        const sf = ts.updateSourceFileNode(
            ts.createSourceFile("./dummy.ts", "", ts.ScriptTarget.Latest),
            node);

        return printer.printNode(ts.EmitHint.Unspecified, sf, sf);
    }

    const sf = (!ts.isSourceFile(node)) ? ts.createSourceFile("./dummy.ts", "", ts.ScriptTarget.Latest) : node;
    return printer.printNode(ts.EmitHint.Unspecified, node, sf);
}