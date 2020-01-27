import { HandlerContext, ComponentInfo } from "../src";
import { Element } from "domhandler";
import { ComponentFile } from "../src/component-file";
import { processTemplate } from "../src/defaultHandlers/template-handler";
import { codegen } from "../src/defaultHandlers/codegen-handler";
import { generateCode } from "../src/ast/ts";
import { format } from "path";
import processComponentFile from "../src/defaultHandlers/file-handler";



export function setupElementTest(content: string) {

    const componentFile = ComponentFile.fromContent(content);

    const context: HandlerContext = {
        componentFiles: [componentFile],
        files: [componentFile.filePath],
        plugins: [],
        options: {
            input: "./test01.html"
        },
        globalLinkElements: [],
        globalStyleElements: [],
        bodyElements: []
    };

    const element = componentFile.dom[0] as Element;

    return { context, componentFile, element };
}

export function codegenSetup(content: string, templateId: string) {
    const { context, componentFile: component, element } = setupElementTest(content);

    expect(processComponentFile(component)).toBe(true);
    expect(processTemplate(component, templateId)).toBe(true);
    expect(codegen(context, component)).toBe(true);

    return generateCode(component.getStatements());
}

export function templateTestSetup(content: string, templateId: string) {

    const { context, componentFile, element } = setupElementTest(content);
    expect(processTemplate(componentFile, templateId)).toBe(true);

    const component = Object.values(componentFile.components)[0];
    const part = Object.values(component.parts)[0];

    expect(component).toHaveProperty(templateId);
    expect(part).not.toBeUndefined();
    const dynamicElement = part.dynamicElements !== undefined && Object.keys(part.dynamicElements).length > 0 ? Object.values(part.dynamicElements)[0] : undefined;

    return {
        template: part, dynamicElement
    };

}

export function dynamicElementTestSetup(content: string, templateId: string) {

    const { context, componentFile, element } = setupElementTest(content);
    expect(processComponentFile(componentFile)).toBe(true);
    expect(processTemplate(componentFile, templateId)).toBe(true);

    const component = Object.values(componentFile.components)[0];
    const part = Object.values(component.parts)[0];

    expect(part).not.toBeUndefined();
    expect(part.dynamicElements).not.toBeUndefined();

    //const dynamicElement = part.dynamicElements !== undefined && Object.keys(part.dynamicElements).length > 0 ? Object.values(part.dynamicElements)[0] : undefined;
    const dynamicElement = Object.values(part.dynamicElements)[0];

    return {
        component,
        part, dynamicElement
    };

}

export function LogResults() {

}




test("utils", () => {

    const { context, componentFile: component, element } = setupElementTest(`<a></a>`)

    expect(context).not.toBeUndefined();
    expect(component).not.toBeUndefined();
    expect(element).not.toBeUndefined();

});


export function formatComponentFileObject(componentFile: ComponentFile) {

    return JSON.stringify(componentFile, (key, value) => {
        switch (key) {
            case 'next':
            case 'parent':
            case 'prev':
                return undefined;
            case 'children':
            case 'data':
            case 'attribs':
            case 'endIndex':
            case 'startIndex':
            case 'type':
            case 'name':
                return value;
        }
        return value;
    }, 4);
}


function formatComponentObject(component: ComponentInfo) {

    return JSON.stringify(component, (key, value) => {
        switch (key) {
            case 'next':
            case 'parent':
            case 'prev':
                return undefined;
            case 'children':
            case 'data':
            case 'attribs':
            case 'endIndex':
            case 'startIndex':
            case 'type':
            case 'name':
                return value;
        }
        return value;
    }, 4);
}
