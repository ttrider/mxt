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


interface Plugin {
    handler: (context: HandlerContext) => boolean;

}

export interface HandlerContext {

    element: Element;
}


interface ComponentFileInfo {

    path: string,
    name: string,
    content: string,
    dom: Node[]
}



async function mxt(options: Options) {

    options.plugins = (options.plugins || []);


    const fileSet = await loadFiles(options.input);



    for (const inputFile of fileSet) {

        processFile(inputFile);

    }
}

async function loadFiles(input: string) {

    const fileSet: ComponentFileInfo[] = [];

    const files = await globp(input, { absolute: true });

    for (const filePath of files) {

        const fileName = path.basename(filePath);
        const ext = path.extname(fileName);

        const fileBuffer = await readFile(filePath);
        if (fileBuffer) {

            const content = fileBuffer.toString();

            fileSet.push({
                path: filePath,
                name: fileName.substr(0, fileName.length - ext.length),
                content: content,
                dom: parseDOM(content)
            });
        }

    }

    return fileSet;
}

async function processFile(inputFile: ComponentFileInfo) {
    console.info(inputFile.name);

    for (const node of inputFile.dom) {
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

export default mxt;


const defaultHandlers: Handler[] = [

];