import glob from "glob";
import util from "util";
import { Node, Element } from "domhandler";
const globp = util.promisify(glob);
import { ComponentFile } from "./component-file";
import { PartReference } from "./template_parts";


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

export interface IdInfo {
    id: string;
}

export interface ElementInfo {

    name: string,
    attributes: { [name: string]: string },
    content?: string,
    expressions?: string[];
}

export interface DynamicElementInfo {

    id: string;
    originalId?: string;
    attributes: { [name: string]: AttributeTokenInfo };
    events: { [name: string]: Eventinfo };
    embeddedParts: PartReference[];
    value?: ExpressionInfo;

}

export interface Eventinfo {

    name: string;
    handler?: string;
    preventDefault?: boolean;
    stopPropagation?: boolean;
    stopImmediatePropagation?: boolean;
    capture?: boolean;
    once?: boolean;
    passive?: boolean;

}

export interface StyleElementInfo extends ElementInfo {
    rules: string[]
}

export interface TokenizedContent {
    content: string,
    references?: string[]
}

























export interface TemplateInfo extends ElementInfo {
    id: string,
    elements: Element[],
    //tokens: AttributeTokenInfo[];
    dynamicElements: { [name: string]: DynamicElementInfo };
}

export interface TokenInfo {
    start: number;
    end: number;
    content: string;
    token: string;
}


export interface ExpressionInfo {
    content: string,
    tokens?: TokenInfo[],
    externalReferences: string[]
}

export interface AttributeTokenInfo extends ExpressionInfo {

    elementId: string;
    elementIdOriginal: string;
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


    beforeTransform?: (context: HandlerContext, componentFile: ComponentFile, node: Node) => boolean;
    transform?: (context: HandlerContext, componentFile: ComponentFile, node: Node) => boolean;
    afterTransform?: (context: HandlerContext, componentFile: ComponentFile, node: Node) => boolean;

    beforeTransformStyle?: (context: HandlerContext, componentFile: ComponentFile, element: Element) => boolean;
    transformStyle?: (context: HandlerContext, componentFile: ComponentFile, element: Element) => boolean;
    afterTransformStyle?: (context: HandlerContext, componentFile: ComponentFile, element: Element) => boolean;

    beforeTransformLink?: (context: HandlerContext, componentFile: ComponentFile, element: Element) => boolean;
    transformLink?: (context: HandlerContext, componentFile: ComponentFile, element: Element) => boolean;
    afterTransformLink?: (context: HandlerContext, componentFile: ComponentFile, element: Element) => boolean;

    beforeTransformScript?: (context: HandlerContext, componentFile: ComponentFile, element: Element) => boolean;
    transformScript?: (context: HandlerContext, componentFile: ComponentFile, element: Element) => boolean;
    afterTransformScript?: (context: HandlerContext, componentFile: ComponentFile, element: Element) => boolean;

    beforeTransformTemplate?: (context: HandlerContext, componentFile: ComponentFile, element: Element) => boolean;
    transformTemplate?: (context: HandlerContext, componentFile: ComponentFile, element: Element) => boolean;
    afterTransformTemplate?: (context: HandlerContext, componentFile: ComponentFile, element: Element) => boolean;

    beforeParseStyle?: (context: HandlerContext, componentFile: ComponentFile, element: Element) => boolean;
    parseStyle?: (context: HandlerContext, componentFile: ComponentFile, element: Element) => boolean;
    afterParseStyle?: (context: HandlerContext, componentFile: ComponentFile, element: Element) => boolean;

    beforeParseScript?: (context: HandlerContext, componentFile: ComponentFile, element: Element) => boolean;
    parseScript?: (context: HandlerContext, componentFile: ComponentFile, element: Element) => boolean;
    afterParseScript?: (context: HandlerContext, componentFile: ComponentFile, element: Element) => boolean;

    beforeParseTemplate?: (context: HandlerContext, componentFile: ComponentFile, element: Element) => boolean;
    parseTemplate?: (context: HandlerContext, componentFile: ComponentFile, element: Element) => boolean;
    afterParseTemplate?: (context: HandlerContext, componentFile: ComponentFile, element: Element) => boolean;

    beforeCodegen?: (context: HandlerContext, componentFile: ComponentFile) => boolean;
    codegen?: (context: HandlerContext, componentFile: ComponentFile) => boolean;
    afterCodegen?: (context: HandlerContext, componentFile: ComponentFile) => boolean;

    beforePackage?: (context: HandlerContext) => boolean;
    package?: (context: HandlerContext) => boolean;
    afterPackage?: (context: HandlerContext) => boolean;
    done?: (context: HandlerContext) => boolean;
}

export interface HandlerContext {

    options: Options,
    files: string[],
    componentFiles: ComponentFile[],
    plugins: Plugin[],

    globalLinkElements: ElementInfo[],
    globalStyleElements: ElementInfo[],
    bodyElements: ElementInfo[]
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
        context.componentFiles.push(await ComponentFile.fromFile(filePath));
    }
}

function transformFile(context: HandlerContext, componentFile: ComponentFile) {

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

function parseFile(context: HandlerContext, componentFile: ComponentFile) {

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

function codegenFile(context: HandlerContext, componentFile: ComponentFile) {
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
function executeComponent(handlerName: PluginComponentHandlers, context: HandlerContext, componentFile: ComponentFile) {

    for (const plugin of context.plugins) {
        const handler = plugin[handlerName];
        if (handler && handler(context, componentFile)) {
            return true;
        }
    }
    return false;
}
function executeComponentNode<T extends keyof PluginHandlerMap>(handlerName: T, context: HandlerContext, componentFile: ComponentFile, element: PluginHandlerMap[T]) {

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




