import glob from "glob";
import util from "util";
import fs from "fs";
import path from "path";
import { parseDOM } from "htmlparser2";
import { Node, Element } from "domhandler";
import { ElementType } from "domelementtype";
import { Handler } from "htmlparser2/lib/Parser";

const globp = util.promisify(glob);
const readFile = util.promisify(fs.readFile);

import { parseSync, parse, traverse } from "@babel/core";
import { statement } from "@babel/template";
import { Expression, SpreadElement, Statement, Scopable, V8IntrinsicIdentifier, JSXNamespacedName, ArgumentPlaceholder, VariableDeclaration } from "@babel/types";





declare type PluginHandlers =
    "beforeLoad" |
    "afterLoad" |
    "beforePackage" |
    "package" |
    "afterPackage" |
    "done";

declare type PluginComponentHandlers =
    "beforeCodegen" |
    "codegen" |
    "afterCodegen";


interface PluginHandlerMap {
    "beforeTransform": Node;
    "transform": Node;
    "afterTransform": Node;

    "beforeTransformStyle": Element;
    "transformStyle": Element;
    "afterTransformStyle": Element;

    "beforeTransformLink": Element;
    "transformLink": Element;
    "afterTransformLink": Element;

    "beforeTransformScript": Element;
    "transformScript": Element;
    "afterTransformScript": Element;

    "beforeTransformTemplate": Element;
    "transformTemplate": Element;
    "afterTransformTemplate": Element;

    "beforeParseStyle": Element;
    "parseStyle": Element;
    "afterParseStyle": Element;

    "beforeParseScript": Element;
    "parseScript": Element;
    "afterParseScript": Element;

    "beforeParseTemplate": Element;
    "parseTemplate": Element;
    "afterParseTemplate": Element;
}

export interface ElementInfo {
    name: string,
    attributes: { [name: string]: string },
    content?: string,
    expressions?: string[];

}
export interface StyleElementInfo extends ElementInfo {
    rules: string[]
}

export interface TemplateInfo extends ElementInfo {
    id: string,
    elements: Element[],
    tokens: AttributeTokenInfo[];
}

export interface ExpressionInfo {
    content: string,
    hasTokens: boolean,
    externalReferences: string[]
}

export interface AttributeTokenInfo extends ExpressionInfo {
    elementId: string;
    attributeName: string;
}

export interface Options {
    input: string;

    plugins?: Plugin[];

    //es5 vs es6

}

interface Plugin {
    beforeLoad?: (context: HandlerContext) => boolean;
    afterLoad?: (context: HandlerContext) => boolean;


    beforeTransform?: (context: HandlerContext, componentFile: ComponentFileInfo, node: Node) => boolean;
    transform?: (context: HandlerContext, componentFile: ComponentFileInfo, node: Node) => boolean;
    afterTransform?: (context: HandlerContext, componentFile: ComponentFileInfo, node: Node) => boolean;

    beforeTransformStyle?: (context: HandlerContext, componentFile: ComponentFileInfo, element: Element) => boolean;
    transformStyle?: (context: HandlerContext, componentFile: ComponentFileInfo, element: Element) => boolean;
    afterTransformStyle?: (context: HandlerContext, componentFile: ComponentFileInfo, element: Element) => boolean;

    beforeTransformLink?: (context: HandlerContext, componentFile: ComponentFileInfo, element: Element) => boolean;
    transformLink?: (context: HandlerContext, componentFile: ComponentFileInfo, element: Element) => boolean;
    afterTransformLink?: (context: HandlerContext, componentFile: ComponentFileInfo, element: Element) => boolean;

    beforeTransformScript?: (context: HandlerContext, componentFile: ComponentFileInfo, element: Element) => boolean;
    transformScript?: (context: HandlerContext, componentFile: ComponentFileInfo, element: Element) => boolean;
    afterTransformScript?: (context: HandlerContext, componentFile: ComponentFileInfo, element: Element) => boolean;

    beforeTransformTemplate?: (context: HandlerContext, componentFile: ComponentFileInfo, element: Element) => boolean;
    transformTemplate?: (context: HandlerContext, componentFile: ComponentFileInfo, element: Element) => boolean;
    afterTransformTemplate?: (context: HandlerContext, componentFile: ComponentFileInfo, element: Element) => boolean;

    beforeParseStyle?: (context: HandlerContext, componentFile: ComponentFileInfo, element: Element) => boolean;
    parseStyle?: (context: HandlerContext, componentFile: ComponentFileInfo, element: Element) => boolean;
    afterParseStyle?: (context: HandlerContext, componentFile: ComponentFileInfo, element: Element) => boolean;

    beforeParseScript?: (context: HandlerContext, componentFile: ComponentFileInfo, element: Element) => boolean;
    parseScript?: (context: HandlerContext, componentFile: ComponentFileInfo, element: Element) => boolean;
    afterParseScript?: (context: HandlerContext, componentFile: ComponentFileInfo, element: Element) => boolean;

    beforeParseTemplate?: (context: HandlerContext, componentFile: ComponentFileInfo, element: Element) => boolean;
    parseTemplate?: (context: HandlerContext, componentFile: ComponentFileInfo, element: Element) => boolean;
    afterParseTemplate?: (context: HandlerContext, componentFile: ComponentFileInfo, element: Element) => boolean;

    beforeCodegen?: (context: HandlerContext, componentFile: ComponentFileInfo) => boolean;
    codegen?: (context: HandlerContext, componentFile: ComponentFileInfo) => boolean;
    afterCodegen?: (context: HandlerContext, componentFile: ComponentFileInfo) => boolean;

    beforePackage?: (context: HandlerContext) => boolean;
    package?: (context: HandlerContext) => boolean;
    afterPackage?: (context: HandlerContext) => boolean;
    done?: (context: HandlerContext) => boolean;
}

export interface HandlerContext {

    options: Options,
    files: string[],
    componentFiles: ComponentFileInfo[],
    plugins: Plugin[],

    globalLinkElements: ElementInfo[],
    globalStyleElements: ElementInfo[],
    bodyElements: ElementInfo[]
}


export interface ComponentFileInfo {

    path: string,
    name: string,
    content: string,
    dom: Node[],
    links: ElementInfo[],
    globalStyles: StyleElementInfo[],

    templates: { [id: string]: TemplateInfo },
    errors: Error[]
}



async function mxt(options: Options) {

    options.plugins = (options.plugins || []);

    const files = await globp(options.input, { absolute: true });

    const context: HandlerContext = {
        options: options,
        files,
        plugins: (options.plugins || []),
        componentFiles: [],
        globalLinkElements: [],
        globalStyleElements: [],
        bodyElements: []
    };

    execute("beforeLoad", context);

    await loadFiles(context);

    execute("afterLoad", context);

    // transform stage
    for (const componentFile of context.componentFiles) {
        transformFile(context, componentFile);
    }
    // parse stage
    for (const componentFile of context.componentFiles) {
        parseFile(context, componentFile);
    }
    // codegen stage
    for (const componentFile of context.componentFiles) {
        codegenFile(context, componentFile);
    }

    execute("beforePackage", context);
    execute("package", context);
    execute("afterPackage", context);
    execute("done", context);
}
export default mxt;

async function loadFiles(context: HandlerContext) {

    for (const filePath of context.files) {

        const fileName = path.basename(filePath);
        const ext = path.extname(fileName);

        const fileBuffer = await readFile(filePath);
        if (fileBuffer) {

            const content = fileBuffer.toString();

            context.componentFiles.push({
                path: filePath,
                name: fileName.substr(0, fileName.length - ext.length),
                content: content,
                dom: parseDOM(content, { xmlMode: true, withStartIndices: true, withEndIndices: true }),
                links: [],
                globalStyles: [],
                templates: {},
                errors: []
            });
        }

    }
}

function transformFile(context: HandlerContext, componentFile: ComponentFileInfo) {

    for (const node of componentFile.dom) {

        executeComponentNode("beforeTransform", context, componentFile, node);
        executeComponentNode("transform", context, componentFile, node);

        if (node.type) {
            const nodeType = node.type.toLowerCase();

            switch (nodeType) {
                case "style":
                    executeComponentNode("beforeTransformStyle", context, componentFile, node as Element);
                    executeComponentNode("transformStyle", context, componentFile, node as Element);
                    executeComponentNode("afterTransformStyle", context, componentFile, node as Element);
                    break;
                case "link":
                    executeComponentNode("beforeTransformLink", context, componentFile, node as Element);
                    executeComponentNode("transformLink", context, componentFile, node as Element);
                    executeComponentNode("afterTransformLink", context, componentFile, node as Element);
                    break;
                case "script":
                    executeComponentNode("beforeTransformScript", context, componentFile, node as Element);
                    executeComponentNode("transformScript", context, componentFile, node as Element);
                    executeComponentNode("afterTransformScript", context, componentFile, node as Element);
                    break;
                case "template":
                    executeComponentNode("beforeTransformTemplate", context, componentFile, node as Element);
                    executeComponentNode("transformTemplate", context, componentFile, node as Element);
                    executeComponentNode("afterTransformTemplate", context, componentFile, node as Element);
                    break;
            }

        }

        executeComponentNode("afterTransform", context, componentFile, node);
    }
}

function parseFile(context: HandlerContext, componentFile: ComponentFileInfo) {

    for (const node of componentFile.dom) {

        if (node.type) {
            const nodeType = node.type.toLowerCase();

            switch (nodeType) {
                case "link":
                case "style":
                    executeComponentNode("beforeParseStyle", context, componentFile, node as Element);
                    executeComponentNode("parseStyle", context, componentFile, node as Element);
                    executeComponentNode("afterParseStyle", context, componentFile, node as Element);
                    break;
                case "script":
                    executeComponentNode("beforeParseScript", context, componentFile, node as Element);
                    executeComponentNode("parseScript", context, componentFile, node as Element);
                    executeComponentNode("afterParseScript", context, componentFile, node as Element);
                    break;
                case "template":
                    executeComponentNode("beforeParseTemplate", context, componentFile, node as Element);
                    executeComponentNode("parseTemplate", context, componentFile, node as Element);
                    executeComponentNode("afterParseTemplate", context, componentFile, node as Element);
                    break;
            }
        }
    }
}

function codegenFile(context: HandlerContext, componentFile: ComponentFileInfo) {
    executeComponent("beforeCodegen", context, componentFile);
    executeComponent("codegen", context, componentFile);
    executeComponent("afterCodegen", context, componentFile);
}



function execute(handlerName: PluginHandlers, context: HandlerContext) {
    for (const plugin of context.plugins) {
        const handler = plugin[handlerName];
        if (handler && handler(context)) {
            return true;
        }
    }
    return false;
}
function executeComponent(handlerName: PluginComponentHandlers, context: HandlerContext, componentFile: ComponentFileInfo) {

    for (const plugin of context.plugins) {
        const handler = plugin[handlerName];
        if (handler && handler(context, componentFile)) {
            return true;
        }
    }
    return false;
}
function executeComponentNode<T extends keyof PluginHandlerMap>(handlerName: T, context: HandlerContext, componentFile: ComponentFileInfo, element: PluginHandlerMap[T]) {

    for (const plugin of context.plugins) {
        const handler = plugin[handlerName];
        if (handler && handler(context, componentFile, element as any)) {
            return true;
        }
    }


    return false;
}

export function extractExpressions(content: string) {

    const expressions: string[] = [];

    const regex = /([^\\]|^)\${([^}]*)}/gm;

    let m;

    while ((m = regex.exec(content)) !== null) {
        // This is necessary to avoid infinite loops with zero-width matches
        if (m.index === regex.lastIndex) {
            regex.lastIndex++;
        }

        expressions.push(m[2]);
    }

    return expressions;
}

export function parseExpressions(content: string) {

    const results = parseSync("`" + content + "`", {
        babelrc: false,
        configFile: false
    });
    if (!results) return;

    const state: ExpressionInfo = {
        content,
        hasTokens: false,
        externalReferences: []
    };

    traverse(results, {
        TemplateLiteral(path) {
            if (path.node.expressions.length > 0) {
                state.hasTokens = true;
            }
        },
        Identifier(path, state: ExpressionInfo) {
            const name = path.node.name;
            if (!path.scope.hasBinding(name)) {
                state.externalReferences.push(name);
            }
        },
    }, undefined, state);

    return state;
}


const defaultHandlers: Handler[] = [

];


