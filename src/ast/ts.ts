import * as ts from "typescript";
import { ExpressionInfo, TokenInfo } from "..";

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

    const tokens: TokenInfo[] = [];
    traverse(node);
    return tokens;
    function traverse(nd: ts.Node) {
        if (ts.isTemplateLiteral(nd)) {

            const tn = nd as any;

            if (tn.templateSpans) {

                for (const ts of tn.templateSpans) {
                    if (ts.expression) {
                        const exp = ts.expression;
                        const start = exp.pos - 3;
                        const content = node.text.substring(exp.pos, exp.end);
                        const token = node.text.substring(start + 1, exp.end + 1);

                        tokens.push({
                            start,
                            end: exp.end,
                            content,
                            token
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


export function tokenizedContent(expressions: ExpressionInfo) {

    let tokenIndex = 0;
    const tokens: { [name: string]: string } = {};

    let { content } = expressions;
    if (expressions.tokens) {

        const { tokens } = expressions
            .tokens
            .sort((a, b) => a.start - b.start)
            .reduce<{ lastToken?: TokenInfo, tokens: TokenInfo[] }>((r, i) => {

                if (r.lastToken) {
                    if (i.start < r.lastToken.end) {
                        return r;
                    }
                }
                r.lastToken = i;
                r.tokens.push(i);
                return r;
            }, { tokens: [] });


        const contentParts: string[] = [];
        let lastIndex = 0;
        for (let index = 0; index < tokens.length; index++) {
            const token = tokens[index];
            if (token.start != lastIndex) {
                contentParts.push(content.substring(lastIndex, token.start));
            }
            contentParts.push(addToken(token.token));
            lastIndex = token.end;
        }
        contentParts.push(content.substring(lastIndex));
        content = contentParts.join("");
    }

    return {

        get content() { return content; },
        set content(value: string) { content = value; },
        addToken,

        get resolved() {
            const reg = /___MXT#\d+#TXM___/gim;
            return content.replace(reg, (id) => {
                return tokens[id];
            })
        }
    }


    function addToken(value: string) {
        const id = "___MXT#" + tokenIndex + "#TXM___";
        tokenIndex++;
        tokens[id] = value;
        return id;
    }
}