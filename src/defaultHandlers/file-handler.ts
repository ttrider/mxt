import * as dom from "domhandler";
import { ComponentFile } from "../component-file";
import { ElementType } from "htmlparser2";
import { Problem, ProblemCode } from "../problem";


function processComponentFile(componentFile: ComponentFile) {

    let err = false;

    const defTemplate: dom.Element[] = [];

    for (let index = 0; index < componentFile.dom.length; index++) {
        const element = componentFile.dom[index] as dom.Element;

        if (element.type === ElementType.Tag) {
            const name = element.name.toLowerCase();

            if (name === "template") {
                if (element.attribs.id) {
                    if (componentFile.templates[element.attribs.id]) {
                        err = true;
                        componentFile.problemFromElement(ProblemCode.ERR001, element);
                    } else {
                        componentFile.templates[element.attribs.id] = element;
                    }
                } else {
                    err = true;
                    componentFile.problemFromElement(ProblemCode.ERR002, element);
                }
            }
            else {
                defTemplate.push(element);
            }
        }
        else if (element.type === ElementType.Style) {
            defTemplate.push(element);
        }
        else if (element.type === ElementType.Script) {
            componentFile.scripts.push(element);
        } else {
            defTemplate.push(element);
        }
    }

    if (defTemplate.length > 0) {
        const dt = new dom.Element("template", {});
        dt.children.push(...defTemplate);
        componentFile.templates[ComponentFile.defaultComponentId] = dt;
    }

    return !err;
}

export default processComponentFile;
