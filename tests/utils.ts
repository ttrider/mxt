import { HandlerContext } from "../src";
import { Element } from "domhandler";
import { ComponentFile } from "../src/component-file";
import { parseTemplate } from "../src/defaultHandlers/template-handler";
import { codegen } from "../src/defaultHandlers/codegen-handler";
import { generateCode } from "../src/ast/ts";



export function setupElementTest(content: string) {

    const component = ComponentFile.fromContent(content);

    const context: HandlerContext = {
        componentFiles: [component],
        files: [component.filePath],
        plugins: [],
        options: {
            input: "./test01.html"
        },
        globalLinkElements: [],
        globalStyleElements: [],
        bodyElements: []
    };

    const element = component.dom[0] as Element;

    return { context, component, element };
}

export function codegenSetup(content: string) {
    const { context, component, element } = setupElementTest(content);

    expect(parseTemplate(context, component, element)).toBe(true);
    expect(codegen(context, component)).toBe(true);
    return generateCode(component.getStatements())
}

export function templateTestSetup(content: string, templateId: string) {

    const { context, component, element } = setupElementTest(content);
    expect(parseTemplate(context, component, element)).toBe(true);
    expect(component.templates).toHaveProperty(templateId);
    const template = component.templates[templateId];
    expect(template).not.toBeUndefined();
    const dynamicElement = template.dynamicElements !== undefined && Object.keys(template.dynamicElements).length > 0 ? Object.values(template.dynamicElements)[0] : undefined;

    return {
        template, dynamicElement
    };

}




test("utils", () => {

    const { context, component, element } = setupElementTest(`<a></a>`)

    expect(context).not.toBeUndefined();
    expect(component).not.toBeUndefined();
    expect(element).not.toBeUndefined();

});
