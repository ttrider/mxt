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

    const ht = hasTokens(textAst, text);

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

function hasTokens(node: ts.SourceFile, content: string) {

    let value = false;
    traverse(node);
    return value;
    function traverse(nd: ts.Node) {
        if (ts.isTemplateSpan(nd)) {
            const pos = nd.pos;
            const end = nd.end;
            const t = content.substring(pos, end);
            const start = nd.getStart(node);
            const width = nd.getWidth(node);
            const fstart = nd.getFullStart();
            const fwidth = nd.getFullWidth();
            const text = nd.getText(node);
            const ftext = nd.getFullText(node);
            console.info(pos, end, t, start,
                width,
                fstart,
                fwidth,
                text,
                ftext);
            value = true;
            //return;
        }
        if (ts.isTemplateLiteral(nd)) {
            
            const tn = nd as any;

            if (tn.templateSpans && tn.templateSpans.lenght>0){

                for (const ts of tn.templateSpans) {

                    console.info(ts);


                    

                }
            }
            
            
            
            const start = nd.getStart(node);
            const width = nd.getWidth(node);
            const fstart = nd.getFullStart();
            const fwidth = nd.getFullWidth();
            const text = nd.getText(node);
            const ftext = nd.getFullText(node);
            console.info(start,
                width,
                fstart,
                fwidth,
                text,
                ftext);

            //return;
        }
        if (ts.isTemplateLiteralToken(nd)) {
            const pos = nd.pos;
            const end = nd.end;
            const t = content.substring(pos, end);

            const start = nd.getStart(node);
            const width = nd.getWidth(node);
            const fstart = nd.getFullStart();
            const fwidth = nd.getFullWidth();
            const text = nd.getText(node);
            const ftext = nd.getFullText(node);
            console.info(pos, end, t, start,
                width,
                fstart,
                fwidth,
                text,
                ftext);

            //return;
        }
        if (ts.isTemplateExpression(nd)) {
            const start = nd.getStart(node);
            const width = nd.getWidth(node);
            const fstart = nd.getFullStart();
            const fwidth = nd.getFullWidth();
            const text = nd.getText(node);
            const ftext = nd.getFullText(node);
            console.info(start,
                width,
                fstart,
                fwidth,
                text,
                ftext);

            //return;
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