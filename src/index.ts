import glob from "glob";
import util from "util";
import fs from "fs";
import path from "path";
import { parseDOM } from "htmlparser2";
import { Node } from "domhandler";

const globp = util.promisify(glob);
const readFile = util.promisify(fs.readFile);


interface Options {
    input: string;

}

interface ComponentFileInfo {

    path: string,
    name: string,
    content: string,
    dom: Node[]
}



async function mxt(options: Options) {

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

    // if you find the top level <style> => add to the <head> as is
    // if you find the top level <script> => add to the generated component
    // if you find anything else => ignore ???

    // if find top level <template> => create the component

    

}




export default mxt;