import ts from "typescript";
import { isEqualIdentifiers } from "./core";


export function ImportStatement(name: string | { name: string, as?: string }[], from: string) {

    const ic = getImportClause(name);

    const obj = ts.createImportDeclaration([], [], ic, ts.createStringLiteral(from));

    return obj;

    function getImportClause(name: string | { name: string, as?: string }[]) {

        if (Array.isArray(name)) {

            const specifiers = name.map(getImportSpecifier);

            return ts.createImportClause(undefined, specifiers.length > 0 ? ts.createNamedImports(specifiers) : undefined);
        }
        return ts.createImportClause(ts.createIdentifier(name), undefined);
    }

}

declare type ImportStatementListBuilder = (ts.ImportDeclaration[]) & { add: ((identifier: string | { name: string, as?: string }, from: string) => ImportStatementListBuilder) };
export function ImportStatementList() {

    const imports: ts.ImportDeclaration[] = [];

    (imports as any).add = add;
    return imports as ImportStatementListBuilder;

    function add(identifier: string | { name: string, as?: string }, from: string) {

        const existing = imports.find(p =>
            p.moduleSpecifier !== undefined
            && ts.isStringLiteral(p.moduleSpecifier)
            && p.moduleSpecifier.text === from);
        if (existing && existing.importClause) {

            if (typeof identifier === "string") {
                if (existing.importClause.name) {
                    if (existing.importClause.name.text !== identifier) {
                        // insert an additional import statement in this case
                        imports.push(ImportStatement(identifier, from));
                    }
                    // do nothing
                } else {
                    existing.importClause.name = ts.createIdentifier(identifier);
                }
            } else {

                const importSpecifier = getImportSpecifier(identifier);

                if (!existing.importClause.namedBindings) {
                    existing.importClause.namedBindings = ts.createNamedImports([importSpecifier]);
                }
                else {
                    const bindings = existing.importClause.namedBindings as ts.NamedImports;
                    // let's see if we have this import already

                    const exi = bindings.elements.find(item => isEqualIdentifiers(item.name, importSpecifier.name));
                    if (exi) {
                        if (isEqualIdentifiers(exi.propertyName, importSpecifier.propertyName)) {
                            // do nothing
                        } else {
                            throw new Error(`property name redefinition '${exi.propertyName} => ${importSpecifier.propertyName}'`)
                        }
                    } else {
                        (bindings.elements as any).push(importSpecifier);
                    }
                }
            }

        } else {
            if (typeof identifier === "string") {
                imports.push(ImportStatement(identifier, from));
            } else {
                imports.push(ImportStatement([{ name: identifier.name, as: identifier.as }], from));
            }
        }

        return imports as ImportStatementListBuilder;
    }
}


function getImportSpecifier(m: { name: string, as?: string }) {
    if (m.as === undefined || m.as === m.name) {
        return ts.createImportSpecifier(undefined, ts.createIdentifier(m.name));
    }
    return ts.createImportSpecifier(ts.createIdentifier(m.name), ts.createIdentifier(m.as));
}