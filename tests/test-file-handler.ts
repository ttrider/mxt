import { parseInlineExpressions } from "../src/ast/ts";
import { ComponentFile } from "../src/component-file";
import processComponentFile from "../src/defaultHandlers/file-handler";
import { ProblemCode } from "../src/problem";

const resources = [
    `<template id="t01"></template>`,
    `<template id="t01"></template><template id="t02"></template>`,
    `<template id="t01"></template><template id="t01"></template>`,
    `<template></template><template id="t01"></template>`,
    `<template id="t01"></template><script></script>`,
    `<style></style><div></div><div></div>`,
];


describe("file handler", () => {

    test("r0", () => {
        const componentFile = ComponentFile.fromContent(resources[0]);
        expect(processComponentFile(componentFile)).toBeTruthy();
        expect(componentFile.templates).toHaveProperty("t01");
        expect(componentFile.errors.length).toBe(0);
        expect(componentFile.scripts.length).toBe(0);
        expect(componentFile.defaultTemplate).toBeUndefined();
    });

    test("r1", () => {
        const componentFile = ComponentFile.fromContent(resources[1]);
        expect(processComponentFile(componentFile)).toBeTruthy();
        expect(componentFile.templates).toHaveProperty("t01");
        expect(componentFile.templates).toHaveProperty("t02");
        expect(componentFile.errors.length).toBe(0);
        expect(componentFile.scripts.length).toBe(0);
        expect(componentFile.defaultTemplate).toBeUndefined();
    });

    test("r2", () => {
        const componentFile = ComponentFile.fromContent(resources[2]);
        expect(processComponentFile(componentFile)).toBeFalsy();
        expect(componentFile.problems.length).toBe(1);
        expect(componentFile.problems[0].code).toBe(ProblemCode.ERR001);
        expect(componentFile.defaultTemplate).toBeUndefined();
    });

    test("r3", () => {
        const componentFile = ComponentFile.fromContent(resources[3]);
        expect(processComponentFile(componentFile)).toBeFalsy();
        expect(componentFile.problems.length).toBe(1);
        expect(componentFile.problems[0].code).toBe(ProblemCode.ERR002);
        expect(componentFile.defaultTemplate).toBeUndefined();

    });

    test("r4", () => {
        const componentFile = ComponentFile.fromContent(resources[4]);
        expect(processComponentFile(componentFile)).toBeTruthy();
        expect(componentFile.templates).toHaveProperty("t01");
        expect(componentFile.errors.length).toBe(0);
        expect(componentFile.scripts.length).toBe(1);
        expect(componentFile.defaultTemplate).toBeUndefined();
    });

    test("r5", () => {
        const componentFile = ComponentFile.fromContent(resources[5]);
        expect(processComponentFile(componentFile)).toBeTruthy();
        expect(componentFile.defaultTemplate).not.toBeUndefined();
        expect(componentFile.errors.length).toBe(0);
    });
});