import { ComponentFileInfo, HandlerContext } from "../src";
import { parseDOM } from "htmlparser2";
import { Node, Element } from "domhandler";

export function setupElementTest(content: string) {

    const component: ComponentFileInfo = {
        content,
        dom: parseDOM(content, { xmlMode: true, withStartIndices: true, withEndIndices: true }),
        name: "Test01",
        path: "./test01",
        links: [],
        globalStyles: [],
        templates: {},
        errors: []
    };

    const context: HandlerContext = {
        componentFiles: [component],
        files: [component.path],
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