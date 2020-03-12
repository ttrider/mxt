import path from "path";
import fs from "fs";
import { promisify } from "util";
import { ComponentFile } from "../../src/component-file";
import processComponentFile from "../../src/defaultHandlers/file-handler";
import processTemplate from "../../src/defaultHandlers/template-handler";
import { formatComponentFileObject } from "../utils";

const writeFile = promisify(fs.writeFile);

describe("msx-end2end", () => {

    const numberOfTests = 3;

    const testSet: string[] = [];
    for (let i = 0; i < numberOfTests; i++) {
        testSet.push("t" + i.toString(16));
    }
    test.each(testSet)('t%#', async (fname) => { expect((await setup(fname)).formatted).toMatchSnapshot(); });
});




async function setup(fileName: string, id: string = "t01") {

    const inputFile = path.resolve(__dirname, "..", "resources", fileName + ".html");
    const outputFile = path.resolve(__dirname, "__snapshots__", "test-end2end", fileName + ".json");
    const componentFile = await ComponentFile.fromFile(inputFile);

    processComponentFile(componentFile);

    for (const tid in componentFile.templates) {
        if (componentFile.templates.hasOwnProperty(tid)) {
            const template = componentFile.templates[tid];
            await processTemplate(componentFile, template);
        }
    }

    const component = componentFile.components[id];

    const formatted = formatComponentFileObject(componentFile);

    await writeFile(outputFile, formatted);

    return {
        componentFile,
        component,
        formatted
    }
}