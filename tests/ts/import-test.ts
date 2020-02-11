import { ImportStatement, generateCode, ImportStatementList } from "../../src/ts";

describe("import", () => {
    test("import - namespace", () => {
        const stmt = ImportStatement("foo", "bar");
        const code = generateCode(stmt);
        expect(code).toBe("import foo from \"bar\";");
    });

    test("import - named", () => {
        const stmt = ImportStatement([{ name: "foo" }], "bar");
        const code = generateCode(stmt);
        expect(code).toBe("import { foo } from \"bar\";");
    });

    test("import - renamed", () => {
        const stmt = ImportStatement([{ name: "foo", as: "oof" }], "bar");
        const code = generateCode(stmt);
        expect(code).toBe("import { foo as oof } from \"bar\";");
    });
});


describe("import list", () => {

    test("import", () => {

        const stmt = ImportStatementList().add("foo", "bar");

        const code = stmt.map(generateCode).join("\n");
        expect(code).toBe(`import foo from "bar";`);
    }); 

    test("dual import", () => {

        const stmt = ImportStatementList().add("foo", "bar").add("bar", "foo");

        const code = stmt.map(generateCode).join("\n");
        expect(code).toBe(`import foo from "bar";`);
    }); 

});