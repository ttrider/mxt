import { HandlerContext } from "../src";
import { parseDOM } from "htmlparser2";
import { Node, Element } from "domhandler";
import { ComponentFile } from "../src/component-file";


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







test("utils", () => {

    const { context, component, element } = setupElementTest(`<a></a>`)

    expect(context).not.toBeUndefined();
    expect(component).not.toBeUndefined();
    expect(element).not.toBeUndefined();

});
