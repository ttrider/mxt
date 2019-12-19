import { ElementInfo, StyleElementInfo, TemplateInfo } from ".";
import { Statement } from "@babel/types";
import * as dom from "domhandler";


export interface ComponentFile {

    path: string,
    name: string,
    content: string,
    dom: dom.Node[],
    links: ElementInfo[],
    globalStyles: StyleElementInfo[],

    templates: { [id: string]: TemplateInfo },
    errors: Error[],

    initStatements: Statement[],
    componentStatements: Statement[],
}
