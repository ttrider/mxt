import { makeAssignment } from "../../src/ast/builder";
import { generateFromAst } from "../../src/ast/generator";
import * as t from "@babel/types";

test("generate from Expression", () => {

    const ast = makeAssignment("foo", "bar");

    const results = generateFromAst(ast);
    expect(results).not.toBeUndefined();
    expect(results.code).not.toBeUndefined();
    expect(results).toMatchSnapshot();
});

test("generate from Statement", () => {

    const ast = t.expressionStatement(makeAssignment("foo", "bar"));

    const results = generateFromAst(ast);
    expect(results).not.toBeUndefined();
    expect(results.code).not.toBeUndefined();
    expect(results).toMatchSnapshot();
});

test("generate from statement array", () => {

    const ast1 = t.expressionStatement(makeAssignment("foo1", "bar1"));
    const ast2 = t.expressionStatement(makeAssignment("foo2", "bar2"));

    const results = generateFromAst([ast1, ast2]);
    expect(results).not.toBeUndefined();
    expect(results.code).not.toBeUndefined();
    expect(results).toMatchSnapshot();
});

test("generate from program", () => {

    const ast1 = t.expressionStatement(makeAssignment("foo1", "bar1"));
    const ast2 = t.expressionStatement(makeAssignment("foo2", "bar2"));

    const results = generateFromAst(t.program([ast1, ast2]));
    expect(results).not.toBeUndefined();
    expect(results.code).not.toBeUndefined();
    expect(results).toMatchSnapshot();
});

test("generate from file", () => {

    const ast1 = t.expressionStatement(makeAssignment("foo1", "bar1"));
    const ast2 = t.expressionStatement(makeAssignment("foo2", "bar2"));

    const results = generateFromAst(t.file(t.program([ast1, ast2]), "generated from AST", undefined));
    expect(results).not.toBeUndefined();
    expect(results.code).not.toBeUndefined();
    expect(results).toMatchSnapshot();

});