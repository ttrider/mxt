import { HandlerContext, ElementInfo, extractExpressions, StyleElementInfo, ComponentInfo, ExpressionInfo } from "../index";
import { Element, DataNode } from "domhandler";
import { ComponentFile } from "../component-file";
import { parseInlineExpressions, tokenizedContent } from "../ast/ts";
import lessHandler from "./less-style-handler";
import sassHandler from "./sass-style-handler";



export async function processStyle(componentFile: ComponentFile, component: ComponentInfo, element: Element) {

    // preprocess styles.
    // in order to less/scss to work, we need to replace ${} tokens and replace them back in the postprocess

    const content = (element.firstChild as DataNode)?.data;
    if (content) {
        const type = element.attribs.type ?? "text/css";

        const expressions = parseInlineExpressions(content);
        if (expressions.tokens) {

            const wrapid = ".${$iid} ";
            const tc = tokenizedContent(expressions);
            const id = tc.addToken(wrapid);
            const results = await doProcessStyle(type, tc.content, id);
            tc.content = results;
            if (!component.dynamicStyles) component.dynamicStyles = [];
            component.dynamicStyles.push({ content: tc.resolved, references: expressions.externalReferences });

        } else if (element.attribs["mxt.global"]) {
            const results = await doProcessStyle(type, content);
            if (!componentFile.styles) componentFile.styles = [];
            componentFile.styles.push({ content: results });
            // global style - used as is
        } else {
            const wrapid = ".${$cid} ";
            const tc = tokenizedContent(expressions);
            const id = tc.addToken(wrapid);
            const results = await doProcessStyle(type, tc.content, id);
            tc.content = results;
            if (!component.styles) component.styles = [];
            component.styles.push({ content: tc.resolved, references: expressions.externalReferences });
            // component-scoped style
        }
    }
}

export async function doProcessStyle(type: string, content: string, wrapClass?: string) {
    switch (type) {
        case "less":
        case "text/less":
            return lessHandler(wrapClass ? (wrapClass + " {" + content + "}") : content);
        case "scss":
        case "text/scss":
            return sassHandler(wrapClass ? (wrapClass + " {" + content + "}") : content, "scss");
        case "sass":
        case "text/sass":
            const css = sassHandler(content, "sass");
            if (wrapClass) {
                return sassHandler(wrapClass + " {" + css + "}", "scss");
            }
            return css;
        case "css":
        case "text/css":
        default:
            if (wrapClass) {
                return sassHandler(wrapClass + " {" + content + "}", "scss");
            }
            return content;
    }
}

