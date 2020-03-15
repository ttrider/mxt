import path from "path";
import fs from "fs";
import { promisify } from "util";
import { ComponentFile } from "../../src/component-file";
import processComponentFile from "../../src/defaultHandlers/file-handler";
import processTemplate from "../../src/defaultHandlers/template-handler";
import { formatComponentFileObject } from "../utils";

const writeFile = promisify(fs.writeFile);

const basePath = path.resolve(__dirname, "..", "resources");
const files = fs.readdirSync(basePath);
const testSet = files.map(f => {

    if (path.extname(f) !== ".html") return undefined;
    const v =
        [
            path.basename(f, ".html"),
            path.resolve(basePath, f)
        ];
    return v;
}
).filter(v => v);

console.log(testSet);

describe("msx-end2end", () => {
    test.each(testSet)('%p', async (data, data2) => {
        const filePath = data2 as any as string;
        expect((await setup(filePath)).formatted).toMatchSnapshot();
    });
});




async function setup(fileName: string) {

    const inputFile = fileName;
    const outputFile = fileName.substring(0, fileName.length - 5) + ".json";

    console.log(inputFile);
    console.log(outputFile);

    const componentFile = await ComponentFile.fromFile(inputFile);

    processComponentFile(componentFile);

    for (const tid in componentFile.templates) {
        if (componentFile.templates.hasOwnProperty(tid)) {
            const template = componentFile.templates[tid];
            await processTemplate(componentFile, template);
        }
    }

    const formatted = formatComponentFileObject(componentFile);

    await writeFile(outputFile, formatted);

    return {
        componentFile,
       
        formatted
    }
}