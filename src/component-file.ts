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

    importStatements: {
        [from: string]: Array<string | { name: string, as: string }>
    } = {};
    styles?: TokenizedContent[];


    private constructor(content: string, filePath: string) {

        this.content = content;
        this.dom = parseDOM(this.content, { xmlMode: true, withStartIndices: true, withEndIndices: true });
        this.filePath = filePath;


    }

    addImport(identifier: string | { name: string, as: string } | Array<string | { name: string, as: string }>, from: string) {

        if (!Array.isArray(identifier)) {
            identifier = [identifier];
        }
        // const definitions = identifier.map<{ name: string, as: string }>(i => {
        //     if (typeof i === "string") {
        //         i = { name: i, as: i };
        //     }
        //     return i;
        // });


        const fromSet = this.importStatements[from];
        if (!fromSet) {
            this.importStatements[from] = identifier;
            return this;
        }

        for (const definition of identifier) {
            // lookup existing definition
            const existing = fromSet.find((item) =>
                (typeof item === "string")
                    ? ((typeof definition === "string") ? (item === definition) : false)
                    : ((typeof definition !== "string") ? (item.as === definition.as) : false));
            if (!existing) {
                fromSet.push(definition);
            } else {
                if ((typeof definition !== "string") && (typeof existing !== "string") && (definition.name != existing.name)) {
                    throw new Error(`redefinition of the import: '${existing.name}' by ${definition.name}`);
                }
            }
        }
        return this;
    }

    getImportStatements() {

        const items: ts.Statement[] = [];

        for (const from in this.importStatements) {
            if (this.importStatements.hasOwnProperty(from)) {

                const imp = this.importStatements[from]
                    .reduce<{ s: string[], o: Array<{ name: string, as: string }> }>((ret, item) => {

                        if (typeof item === "string") {
                            ret.s.push(item);
                        } else {
                            ret.o.push(item);
                        }
                        return ret;
                    }, { s: [], o: [] });

                if (imp.o.length > 0) {
                    items.push(d.ImportStatement(imp.o, from));
                }

                for (const item of imp.s) {
                    items.push(d.ImportStatement(item, from));
                }
            }
        }
        return items;
    }

    getStatements() {
        const s =
            [
                ...this.getImportStatements(),
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
