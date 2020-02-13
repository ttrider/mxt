import { ElementInfo, StyleElementInfo, TemplateInfo, ComponentInfo, TokenizedContent } from ".";
import { parseDOM } from "htmlparser2";
import * as dom from "domhandler";
import fs from "fs";
import path from "path";
import util from "util";
import ts from "typescript";
import * as d from "./ts";
import { Problem, ProblemCode } from "./problem";

const readFile = util.promisify(fs.readFile);



export class ComponentFile {
    static defaultComponentId: string = "$$default$$component$$";

    problems: Problem[] = [];

    filePath: string;
    content: string;
    dom: dom.Node[];

    templates: { [id: string]: dom.Element } = {};
    scripts: dom.Element[] = [];


    links: ElementInfo[] = [];
    globalStyles: StyleElementInfo[] = [];


    components: { [id: string]: ComponentInfo } = {};
    errors: Error[] = [];

    initStatements = d.StatementList();
    componentStatements = d.StatementList();

    imports = d.ImportStatementList();

    styles?: TokenizedContent[];


    private constructor(content: string, filePath: string) {

        this.content = content;
        this.dom = parseDOM(this.content, { xmlMode: true, withStartIndices: true, withEndIndices: true });
        this.filePath = filePath;


    }

    getStatements() {
        const s =
            [
                ...this.imports,
                ...this.initStatements,
                ...this.componentStatements
            ] as ts.Statement[];
        return s;
    }






    static fromContent(content: string, filePath: string = "./dummy.html") {
        return new ComponentFile(content, filePath);
    }

    static async fromFile(filePath: string) {
        filePath = path.resolve(filePath);
        const fileBuffer = await readFile(filePath);
        if (!fileBuffer) {
            throw new Error("can't read the file: " + filePath);
        }
        const content = fileBuffer.toString();
        return new ComponentFile(content, filePath);
    }


    problemFromElement(code: ProblemCode, element: dom.Element) {
        this.problems.push(Problem.fromElement(code, element));
    }
}
