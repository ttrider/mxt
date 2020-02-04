import { TokenizedContent } from "../index";
import { parseInlineExpressions, tokenizedContent } from "../ast/ts";
import lessHandler from "./less-style-handler";
import sassHandler from "./sass-style-handler";



export async function processStyle(content?: string, type?: string, isGlobal?: boolean):
    Promise<{
        dynamicStyle?: TokenizedContent,
        globalStyle?: TokenizedContent,
        componentStyle?: TokenizedContent
    }> {


    if (content) {
        type = type ?? "text/css";

        const expressions = parseInlineExpressions(content);
        if (expressions.tokens) {

            const wrapid = ".${$iid} ";
            const tc = tokenizedContent(expressions);
            const id = tc.addToken(wrapid);
            const results = await doProcessStyle(type, tc.content, id);
            tc.content = results;
            return {
                dynamicStyle: { content: tc.resolved, references: expressions.externalReferences }
            }
        }

        if (isGlobal) {
            const results = await doProcessStyle(type, content);
            return {
                globalStyle: { content: results }
            }
        }

        const wrapid = ".${$cid} ";
        const tc = tokenizedContent(expressions);
        const id = tc.addToken(wrapid);
        const results = await doProcessStyle(type, tc.content, id);
        tc.content = results;

        return {
            componentStyle: { content: tc.resolved, references: expressions.externalReferences }
            // component-scoped style
        }
    }
    return {};
}
export default processStyle;

async function doProcessStyle(type: string, content: string, wrapClass?: string) {
    
    switch (type) {
        case "less":
        case "text/less":
            return await lessHandler(wrapClass ? (wrapClass + " { " + content + " } ") : content);
        case "scss":
        case "text/scss":
            return await sassHandler(wrapClass ? (wrapClass + " { " + content + " } ") : content, "scss");
        case "sass":
        case "text/sass":
            const css = await sassHandler(content, "sass");
            if (wrapClass) {
                return await sassHandler(wrapClass + " { " + css + " } ", "scss");
            }
            return css;
        case "css":
        case "text/css":
        default:
            if (wrapClass) {
                return await sassHandler(wrapClass + " { " + content + " } ", "scss");
            }
            return content;
    }
}

