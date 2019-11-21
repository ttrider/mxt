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


export interface Options {
    input: string;

    plugins?: Plugin[];

    //es5 vs es6

}

/*
events:

    

                    






*/

declare type PluginHandlers =
    "beforeLoad" |
    "afterLoad" |

    "beforeTransform" |
    "transform" |
    "beforeTransformStyle" |
    "transformStyle" |
    "beforeTransformLink" |
    "transformLink" |
    "afterTransformLink" |
    "beforeTransformScript" |
    "transformScript" |
    "afterTransformScript" |
    "beforeTransformTemplate" |
    "transformTemplate" |
    "afterTransformTemplate" |
    "afterTransform" |
    "beforeParseStyle" |
    "parseStyle" |
    "afterParseStyle" |
    "beforeParseScript" |
    "parseScript" |
    "afterParseScript" |
    "beforeParseTemplate" |
    "parseTemplate" |
    "afterParseTemplate" |
    "beforeCodegen" |
    "codegen" |
    "afterCodegen" |
    "beforePackage" |
    "package" |
    "afterPackage" |
    "done";

interface Plugin {
    beforeLoad?: (context: HandlerContext) => boolean;
    load?: (context: HandlerContext) => boolean;
    afterLoad?: (context: HandlerContext) => boolean;
    beforeTransform?: (context: HandlerContext) => boolean;
    transform?: (context: HandlerContext) => boolean;
    beforeTransformStyle?: (context: HandlerContext) => boolean;
    transformStyle?: (context: HandlerContext) => boolean;
    beforeTransformLink?: (context: HandlerContext) => boolean;
    transformLink?: (context: HandlerContext) => boolean;
    afterTransformLink?: (context: HandlerContext) => boolean;
    beforeTransformScript?: (context: HandlerContext) => boolean;
    transformScript?: (context: HandlerContext) => boolean;
    afterTransformScript?: (context: HandlerContext) => boolean;
    beforeTransformTemplate?: (context: HandlerContext) => boolean;
    transformTemplate?: (context: HandlerContext) => boolean;
    afterTransformTemplate?: (context: HandlerContext) => boolean;
    afterTransform?: (context: HandlerContext) => boolean;
    beforeParseStyle?: (context: HandlerContext) => boolean;
    parseStyle?: (context: HandlerContext) => boolean;
    afterParseStyle?: (context: HandlerContext) => boolean;
    beforeParseScript?: (context: HandlerContext) => boolean;
    parseScript?: (context: HandlerContext) => boolean;
    afterParseScript?: (context: HandlerContext) => boolean;
    beforeParseTemplate?: (context: HandlerContext) => boolean;
    parseTemplate?: (context: HandlerContext) => boolean;
    afterParseTemplate?: (context: HandlerContext) => boolean;
    beforeCodegen?: (context: HandlerContext) => boolean;
    codegen?: (context: HandlerContext) => boolean;
    afterCodegen?: (context: HandlerContext) => boolean;
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

    element?: Element;
}


interface ComponentFileInfo {

    path: string,
    name: string,
    content: string,
    dom: Node[]
}



async function mxt(options: Options) {

    options.plugins = (options.plugins || []);

    const files = await globp(options.input, { absolute: true });

    const context: HandlerContext = {
        options: options,
        files,
        plugins: (options.plugins || []),
        componentFiles: []
    };

    executePluginMethod("beforeLoad", context);

    await loadFiles(context);

    executePluginMethod("afterLoad", context);

    // transform stage
    for (const componentFile of context.componentFiles) {
        transformFile(context, componentFile);
    }
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
                dom: parseDOM(content)
            });
        }

    }
}

async function transformFile(context: HandlerContext, componentFile: ComponentFileInfo) {

    for (const node of componentFile.dom) {

        executePluginMethod("beforeTransform", context, componentFile, node);

        executePluginMethod("transform", context, componentFile, node);

        executePluginMethod("afterTransform", context, componentFile, node);


        if (node.type) {
            switch (node.type.toLowerCase()) {
                case "style": {

                }
                case "link": {

                }
                case "script": {

                }
                case "template": {

                }

            }
        }

    }



}

function executePluginMethod(handlerName: PluginHandlers, context: HandlerContext) {

    for (const plugin of context.plugins) {
        const handler = plugin[handlerName];
        if (handler && handler(context)) {
            return true;
        }
    }
    return false;
}




const defaultHandlers: Handler[] = [

];