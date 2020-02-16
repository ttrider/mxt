import { ComponentFile } from "../src/component-file";
import { processMxtImport, processMxtComponent } from "../src/defaultHandlers/template-handler";
import { Element } from "domhandler";
import { generateCode } from "../src/ts";
import { Component } from "../src/component";
import { ProblemCode } from "../src/problem";

describe("msx-import", () => {

  test("component without import", () => {
    const ret = createInputElement("foo", {});
    expect(ret.code).toBeFalsy();
    expect(ret.componentFile.problems).toHaveLength(1);
    expect(ret.componentFile.problems[0].code).toBe(ProblemCode.ERR007);
  });

  test("component with name", () => {
    const ret = createInputElement("foo", { name: "cname" });
    expect(ret.componentFile.problems).toHaveLength(0);
    expect(ret.code).toBeFalsy();
    expect(ret.component.importParts["cname"]).toBeTruthy();
  });

  test("component with named import", () => {
    const ret = createInputElement("foo", { name: "cname", from: "cfrom" });
    expect(ret.componentFile.problems).toHaveLength(0);
    expect(ret.code).toBe("import { cname } from \"cfrom\";");
    expect(ret.component.importParts["cname"]).toBeTruthy();
    expect(ret.part).toBeTruthy();
    if (ret.part) expect(ret.part.partId).toBe(ret.component.importParts["cname"]);
  });

  test("component with default import", () => {
    const ret = createInputElement("foo", { as: "cname", from: "cfrom" });
    expect(ret.componentFile.problems).toHaveLength(0);
    expect(ret.code).toBe("import cname from \"cfrom\";");
    expect(ret.component.importParts["cname"]).toBeTruthy();
    expect(ret.part).toBeTruthy();
    if (ret.part) expect(ret.part.partId).toBe(ret.component.importParts["cname"]);
  });

  test("component with renamed import", () => {
    const ret = createInputElement("foo", { as: "cname", from: "cfrom", name: "origname" });
    expect(ret.componentFile.problems).toHaveLength(0);
    expect(ret.code).toBe("import { origname as cname } from \"cfrom\";");
    expect(ret.component.importParts["cname"]).toBeTruthy();
    expect(ret.part).toBeTruthy();
    if (ret.part) expect(ret.part.partId).toBe(ret.component.importParts["cname"]);
  });

  test("component with data binding", () => {
    const ret = createInputElement("foo", { name: "cname", with: "${datasource}" });
    expect(ret.componentFile.problems).toHaveLength(0);
    expect(ret.code).toBeFalsy();
    expect(ret.component.importParts["cname"]).toBeTruthy();
    if (ret.part) expect(ret.part.dc).toBeTruthy();
    if (ret.part && ret.part.dc) {
      expect(ret.part.dc.content).toBe("${datasource}");
      expect(ret.part.dc.externalReferences[0]).toBe("datasource");
    }

  });

  test("component with data binding 2", () => {
    const ret = createInputElement("foo", { name: "cname", with: "${datasource.more}" });
    expect(ret.componentFile.problems).toHaveLength(0);
    expect(ret.code).toBeFalsy();
    expect(ret.component.importParts["cname"]).toBeTruthy();
    if (ret.part) expect(ret.part.dc).toBeTruthy();
    if (ret.part && ret.part.dc) {
      expect(ret.part.dc.content).toBe("${datasource.more}");
      expect(ret.part.dc.externalReferences[0]).toBe("datasource");
    }

  });
});

function createInputElement(name: string, attribs: { [name: string]: string }) {

  const input = `<template id="t01" type="mxt"></template>`;
  const cf = ComponentFile.fromContent(input);
  const c = new Component(name)
  const el = new Element(name, attribs);
  el.startIndex = 0;
  el.endIndex = 1;

  const part = processMxtComponent(cf, c, el);

  return {
    code: cf.imports.map(generateCode).join("\n"),
    component: c,
    componentFile: cf,
    part
  };

}

