import { ComponentFile } from "../../src/component-file";
import { processMxtImport, processMxtWith } from "../../src/defaultHandlers/template-handler";
import { Element } from "domhandler";
import { generateCode } from "../../src/ts";
import { Component } from "../../src/component";

describe("msx-with", () => {

  test("import from as", () => {
    const part = createInputElement("mxt.import", { data: "${value}" });

    expect(part).toBeTruthy();
    if (!part) return;
    expect(part.dc).toBeTruthy();
    if (part.dc) expect(part.dc.externalReferences[0]).toBe("value");
  });


});

function createInputElement(name: string, attribs: { [name: string]: string }) {

  const input = `<template id="t01" type="mxt"></template>`;
  const cf = ComponentFile.fromContent(input);
  const c = new Component(name);
  const el = new Element(name, attribs);
  el.startIndex = 0;
  el.endIndex = 1;
  el.children.push(new Element("div", {}));

  return processMxtWith(cf, c, el);
}

