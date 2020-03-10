import path from "path";
import { ComponentFile } from "../../src/component-file";
import processComponentFile from "../../src/defaultHandlers/file-handler";
import processTemplate from "../../src/defaultHandlers/template-handler";


describe("msx-end2end", () => {
    test("t00", async () => {
        expect((await setup("t00")).component).toMatchSnapshot();
    });

});




async function setup(fileName: string, id: string = "t01") {

    const inputFile = path.resolve(__dirname, "..", "resources", fileName + ".html");
    const componentFile = await ComponentFile.fromFile(inputFile);

    processComponentFile(componentFile);
    await processTemplate(componentFile, componentFile.templates[id]);

    const component = componentFile.components[id];

    return {
        componentFile,
        component
    }
}