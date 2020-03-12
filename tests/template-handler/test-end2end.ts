import path from "path";
import { ComponentFile } from "../../src/component-file";
import processComponentFile from "../../src/defaultHandlers/file-handler";
import processTemplate from "../../src/defaultHandlers/template-handler";
import { formatComponentFileObject } from "../utils";


describe("msx-end2end", () => {
    test("t00", async () => {
        const { componentFile } = await setup("t00");
        const cf = formatComponentFileObject(componentFile);
        expect(cf).toMatchSnapshot();
    });

});




async function setup(fileName: string, id: string = "t01") {

    const inputFile = path.resolve(__dirname, "..", "resources", fileName + ".html");
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

    return {
        componentFile,
        component,
        formatted
    }
}