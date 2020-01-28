import * as ts from "typescript";
import { ExpressionInfo } from "..";

export function parseInlineExpressions(content: string) {

    const state: ExpressionInfo = {

        content,
        externalReferences: []
    };

    const { program, source } = getProgram("`" + content + "`");

    const tokens = getTokens(source);

    if (tokens.length > 0) {
        const diags = ts.getPreEmitDiagnostics(program);

        if (diags) {
            state.tokens = tokens;
            state.externalReferences =
                diags
                    .filter(r => r.code === 2304)
                    .map(r => content.substr(r.start === undefined ? 0 : r.start - 1, r.length));
        }

    }

    return state;
}


function getProgram(content: string) {
    const dummyFilePath = "/file.ts";
    const source = ts.createSourceFile(dummyFilePath, content, ts.ScriptTarget.Latest);

    const options: ts.CompilerOptions = {};
    const host: ts.CompilerHost = {
        fileExists: filePath => filePath === dummyFilePath,
        directoryExists: dirPath => dirPath === "/",
        getCurrentDirectory: () => "/",
        getDirectories: () => [],
        getCanonicalFileName: fileName => fileName,
        getNewLine: () => "\n",
        getDefaultLibFileName: () => "",
        getSourceFile: filePath => filePath === dummyFilePath ? source : undefined,
        readFile: filePath => filePath === dummyFilePath ? content : undefined,
        useCaseSensitiveFileNames: () => true,
        writeFile: () => { }
    };
    const program = ts.createProgram({
        options,
        rootNames: [dummyFilePath],
        host
    });

    return { program, source };
}


function getTokens(node: ts.SourceFile) {

    const tokens: Array<{ start: number, end: number, text: string }> = [];
    traverse(node);
    return tokens;
    function traverse(nd: ts.Node) {
        if (ts.isTemplateLiteral(nd)) {

            const tn = nd as any;

            if (tn.templateSpans) {

                for (const ts of tn.templateSpans) {

                    if (ts.expression) {
                        tokens.push({
                            start: ts.start - 1,
                            end: ts.end - 1,
                            text: ts.text
                        });
                    }
                }
            }
            return;
        }
        ts.forEachChild(nd, traverse);
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