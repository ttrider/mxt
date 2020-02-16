import { ComponentFile } from "../src/component-file";
import { processMxtImport } from "../src/defaultHandlers/template-handler";
import { Element } from "domhandler";
import { generateCode } from "../src/ts";

describe("msx-import", () => {

  test("import from as", () => { 
    const code = createInputElement("mxt.import", { from: "./if03", as: "foo" });
    expect(code).toBe("import foo from \"./if03\";");
  });

  test("import from name", () => {
    const code = createInputElement("mxt.import", { from: "./if03", name: "foo" });
    expect(code).toBe("import { foo } from \"./if03\";");
  });

  test("import from name as", () => {
    const code = createInputElement("mxt.import", { from: "./if03", name: "foo", as: "bar" });
    expect(code).toBe("import { foo as bar } from \"./if03\";");
  });

});

function createInputElement(name: string, attribs: { [name: string]: string }) {

  const input = `<template id="t01" type="mxt"></template>`;
  const cf = ComponentFile.fromContent(input);
  const el = new Element(name, attribs);
  el.startIndex = 0;
  el.endIndex = 1;

  processMxtImport(cf, undefined, el);

  return cf.imports.map(generateCode).join("\n");

}

