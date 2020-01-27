import path from "path";
import fs from "fs";
import { ComponentFile } from "../../src/component-file";
import { parseTemplate } from "../../src/defaultHandlers/template-handler";



const testRange = {
    from: 0,
    to: 1,
    except: [] as number[]
}

describe("Functional Tests", () => {

    test("gen", () => {

        for (let index = testRange.from; index < testRange.to; index++) {
            if (testRange.except.indexOf(index) !== -1) {
                //const element = array[index];

                test("Functional: " + index, () => {

                    const res = loadResources(index);
                    expect(res).not.toBeUndefined();

                    if (!res.componentFile) return;

                    //expect(parseTemplate(res.componentFile, element)).toBe(true);



                });
            }
        }
    });
});



declare type ResourceSet = {
    componentFile: ComponentFile | undefined;
    json: string | undefined;
    ts: string | undefined;
    js: string | undefined;
};

function loadResources(index: number) {

    const dir = path.resolve(__dirname, "../", "resources");

    const name = "t" + (index < 10 ? ("0" + index.toString()) : index.toString());
    const htmlFile = path.resolve(dir, name + ".html");
    const jsonFile = path.resolve(dir, name + ".json");
    const tsFile = path.resolve(dir, name + ".ts");
    const jsFile = path.resolve(dir, name + ".js");

    return {
        componentFile: fs.existsSync(htmlFile) ? ComponentFile.fromContent(fs.readFileSync(htmlFile).toString(), htmlFile) : undefined,
        json: fs.existsSync(jsonFile) ? fs.readFileSync(jsonFile).toString() : undefined,
        ts: fs.existsSync(tsFile) ? fs.readFileSync(tsFile).toString() : undefined,
        js: fs.existsSync(jsFile) ? fs.readFileSync(jsFile).toString() : undefined,
    } as ResourceSet
}

function saveResources(index: number, resources: ResourceSet) {

    const dir = path.resolve(__dirname, "../", "resources");

    const name = "t" + (index < 10 ? ("0" + index.toString()) : index.toString());
    const htmlFile = path.resolve(dir, name + ".html");
    const jsonFile = path.resolve(dir, name + ".json");
    const tsFile = path.resolve(dir, name + ".ts");
    const jsFile = path.resolve(dir, name + ".js");


    if (resources.json) fs.writeFileSync(jsonFile, resources.json);
    if (resources.ts) fs.writeFileSync(tsFile, resources.ts);
    if (resources.js) fs.writeFileSync(jsFile, resources.js);
}
