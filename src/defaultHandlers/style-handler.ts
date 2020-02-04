import less from "less";
import sass from "sass";
import { TokenizedContent } from "../index";
import { parseInlineExpressions, tokenizedContent } from "../ast/ts";

const handlers = {
    "less": lessHandler,
    "text/less": lessHandler,
    "scss": scssHandler,
    "text/scss": scssHandler,
    "sass": sassHandler,
    "text/sass": sassHandler,
    "css": cssHandler,
    "text/css": cssHandler
}

export async function processStyle(content?: string, type?: string, isGlobal?: boolean):
    Promise<{
        dynamicStyle?: TokenizedContent,
        globalStyle?: TokenizedContent,
        componentStyle?: TokenizedContent
    }> {


    if (content) {

        const handler = (handlers[type ?? "text/css"] ?? cssHandler);

        const expressions = parseInlineExpressions(content);
        if (expressions.tokens) {

            const wrapid = ".${$iid} ";
            const tc = tokenizedContent(expressions);
            const id = tc.addToken(wrapid);
            const results = await handler(tc.content, id);
            tc.content = results;
            return {
                dynamicStyle: { content: tc.resolved, references: expressions.externalReferences }
            }
        }

        if (isGlobal) {
            const results = await handler(content);
            return {
                globalStyle: { content: results }
            }
        }

        const wrapid = ".${$cid} ";
        const tc = tokenizedContent(expressions);
        const id = tc.addToken(wrapid);
        const results = await handler(tc.content, id);
        tc.content = results;

        return {
            componentStyle: { content: tc.resolved, references: expressions.externalReferences }
        }
    }
    return {};
}
export default processStyle;


async function cssHandler(content: string, wrapClass?: string) {

    if (wrapClass) {
        return await scssHandler(content, wrapClass);
    }
    return content;
}

async function lessHandler(content: string, wrapClass?: string) {

    const output = await less.render(wrapClass ? (wrapClass + " { " + content + " } ") : content);
    return output.css;
}

async function sassHandler(content: string, wrapClass?: string) {

    const { css } = sass.renderSync({
        data: content,
        indentedSyntax: true,
    });

    const cssValue = css.toString();

    if (wrapClass) {
        return (sass.renderSync({
            data: wrapClass + " { " + cssValue + " } ",
            indentedSyntax: false,
        })).css.toString();
    }
    return cssValue;
}

async function scssHandler(content: string, wrapClass?: string) {

    const output = sass.renderSync({
        data: wrapClass ? wrapClass + " { " + content + " } " : content,
        indentedSyntax: false,
    })

    return output.css.toString();
}
