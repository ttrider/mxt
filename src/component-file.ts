import { ElementInfo, StyleElementInfo, TemplateInfo } from ".";
import { parseDOM } from "htmlparser2";
import * as dom from "domhandler";
import fs from "fs";
import path from "path";
import util from "util";
import ts from "typescript";
import * as d from "./ts";

const readFile = util.promisify(fs.readFile);


export class ComponentFile {

    filePath: string;
    content: string;
    dom: dom.Node[];
    links: ElementInfo[] = [];
    globalStyles: StyleElementInfo[] = [];

    templates: { [id: string]: TemplateInfo } = {};
    errors: Error[] = [];

    initStatements = d.StatementList();
    componentStatements = d.StatementList();

    importStatements: {
        [from: string]: { name: string, as: string }[]
    } = {};

    private constructor(content: string, filePath: string) {

        this.content = content;
        this.dom = parseDOM(this.content, { xmlMode: true, withStartIndices: true, withEndIndices: true });
        this.filePath = filePath;
    }

    addImport(identifier: string | { name: string, as: string } | Array<string | { name: string, as: string }>, from: string) {

        if (!Array.isArray(identifier)) {
            identifier = [identifier];
        }
        const definitions = identifier.map<{ name: string, as: string }>(i => {
            if (typeof i === "string") {
                i = { name: i, as: i };
            }
            return i;
        });


        const fromSet = this.importStatements[from];
        if (!fromSet) {
            this.importStatements[from] = definitions;
            return;
        }

        for (const definition of definitions) {
            // lookup existing definition
            const existing = fromSet.find((item) => item.as === definition.as);
            if (!existing) {
                fromSet.push(definition);
            } else {

                if (definition.name != existing.name) {
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

                const ii = d.ImportStatement(this.importStatements[from], from);

                items.push(ii);
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






    static fromContent(content: string) {
        return new ComponentFile(content, "./dummy.html")
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
}
