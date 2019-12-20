import { ElementInfo, StyleElementInfo, TemplateInfo } from ".";
import { parseDOM } from "htmlparser2";
import * as dom from "domhandler";
import * as t from "@babel/types";
import fs from "fs";
import path from "path";
import util from "util";
import { statementList, StatementItem } from "./code-utils";

const readFile = util.promisify(fs.readFile);


export class ComponentFile {

    filePath: string;
    content: string;
    dom: dom.Node[];
    links: ElementInfo[] = [];
    globalStyles: StyleElementInfo[] = [];

    templates: { [id: string]: TemplateInfo } = {};
    errors: Error[] = [];

    initStatements = statementList();
    componentStatements = statementList();

    importStatements: {
        [from: string]: { variable: string, as: string }[]
    } = {};

    private constructor(content: string, filePath: string) {

        this.content = content;
        this.dom = parseDOM(this.content, { xmlMode: true, withStartIndices: true, withEndIndices: true });
        this.filePath = filePath;
    }

    addImport(identifier: string | { variable: string, as: string } | Array<string | { variable: string, as: string }>, from: string) {

        if (!Array.isArray(identifier)) {
            identifier = [identifier];
        }
        const definitions = identifier.map<{ variable: string, as: string }>(i => {
            if (typeof i === "string") {
                i = { variable: i, as: i };
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

                if (definition.variable != existing.variable) {
                    throw new Error(`redefinition of the import: '${existing.variable}' by ${definition.variable}`);
                }
            }
        }
        return this;
    }

    

    getImportStatements() {

        const items: t.Statement[] = [];

        for (const from in this.importStatements) {
            if (this.importStatements.hasOwnProperty(from)) {
                items.push(
                    t.importDeclaration(
                        this.importStatements[from].map(i =>
                            t.importSpecifier(
                                t.identifier(i.as),
                                t.identifier(i.variable))),
                        t.stringLiteral(from)));
            }
        }
        return items;
    }

    getStatements() {
        const statements: t.Statement[] =
            [
                ...this.getImportStatements(),
                ...this.initStatements.statements,
                ...this.componentStatements.statements
            ];
        return statements;
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
