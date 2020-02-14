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

    test("import", () => {

        const stmt = ImportStatementList().add("foo", "bar");

        const code = stmt.map(generateCode).join("\n");
        expect(code).toBe(`import foo from "bar";`);
    });

    test("dual import", () => {

        const stmt = ImportStatementList().add("foo", "bar").add("bar", "foo");

        const code = stmt.map(generateCode).join("\n");
        expect(code).toBe("import foo from \"bar\";\nimport bar from \"foo\";");
    });

    test("multiple defaults imports for the same from", () => {

        const stmt = ImportStatementList().add("foo", "foobar").add("bar", "foobar");

        const code = stmt.map(generateCode).join("\n");
        expect(code).toBe("import foo from \"foobar\";\nimport bar from \"foobar\";");
    });

    

    test("multiple default props import", () => {

        const stmt = ImportStatementList().add({ name: "foo" }, "foobar").add({ name: "bar" }, "foobar");

        const code = stmt.map(generateCode).join("\n");
        expect(code).toBe("import { foo, bar } from \"foobar\";");
    });

    test("duplicate props import", () => {
        const stmt = ImportStatementList().add({ name: "foo" }, "foobar").add({ name: "foo" }, "foobar");
 
        const code = stmt.map(generateCode).join("\n");
        expect(code).toBe("import { foo } from \"foobar\";");
    });

    test("multiple props import with rename", () => {

        const stmt = ImportStatementList().add({ name: "foo", as: "f" }, "foobar").add({ name: "bar", as: "b" }, "foobar");

        const code = stmt.map(generateCode).join("\n");
        expect(code).toBe("import { foo as f, bar as b } from \"foobar\";");
    });

    test("duplicate props import with rename", () => {

        const stmt = ImportStatementList().add({ name: "foo", as: "f" }, "foobar").add({ name: "foo", as: "f" }, "foobar");

        const code = stmt.map(generateCode).join("\n");
        expect(code).toBe("import { foo as f } from \"foobar\";");
    });

    test("mixed import", () => {

        const stmt = ImportStatementList().add({ name: "foo", as: "f" }, "foobar").add("bar", "foobar");

        const code = stmt.map(generateCode).join("\n");
        expect(code).toBe("import bar, { foo as f } from \"foobar\";");
    });

});