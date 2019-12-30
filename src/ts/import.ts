import ts from "typescript";


export function ImportStatement(name: string | { name: string, as?: string }[], from: string) {

    const ic = getImportClause(name);

    const obj = ts.createImportDeclaration([], [], ic, ts.createStringLiteral(from));

    return obj;

    function getImportClause(name: string | { name: string, as?: string }[]) {

        if (Array.isArray(name)) {

            const specifiers = name
                .map(m => {

                    if (m.as === undefined || m.as === m.name) {
                        return ts.createImportSpecifier(undefined, ts.createIdentifier(m.name));
                    }
                    return ts.createImportSpecifier(ts.createIdentifier(m.name), ts.createIdentifier(m.as));
                });

            return ts.createImportClause(undefined, specifiers.length > 0 ? ts.createNamedImports(specifiers) : undefined);
        }
        return ts.createImportClause(ts.createIdentifier(name), undefined);
    }

}



// export function pickCard(x: { suit: string; card: number; }[], y: string): number;
// export function pickCard(x: number, y): { suit: string; card: number; };
// export function pickCard(x, y): any {

// }