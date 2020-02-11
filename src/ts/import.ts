import ts from "typescript";


export function ImportStatement(name: string | { name: string, as?: string }[], from: string) {

    const ic = getImportClause(name);

    const obj = ts.createImportDeclaration([], [], ic, ts.createStringLiteral(from));

    return obj;

    function getImportClause(name: string | { name: string, as?: string }[]) {

        if (Array.isArray(name)) {

            const specifiers = name
                .map(getImportSpecifier);

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

        const existing = imports.find(p => p.moduleSpecifier.getText() === from);
        if (existing && existing.importClause) {

            if (typeof identifier === "string") {
                if (existing.importClause.name) {
                    if (existing.importClause.name.text !== identifier) {
                        throw new Error("can't redefine a namespace import");
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
                    (bindings.elements as any).push(importSpecifier);
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