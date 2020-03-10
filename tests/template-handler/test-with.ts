import { ComponentFile } from "../../src/component-file";
import { processMxtImport, processMxtWith } from "../../src/defaultHandlers/template-handler";
import { Element } from "domhandler";
import { generateCode } from "../../src/ts";
import { Component } from "../../src/component";
import { PartReference } from "../../src/template-parts";

describe("msx-with", () => {

  test("import from as", () => {
    const { partRef } = createInputElement("mxt.import", { data: "${value}" });

    expect(partRef).toBeTruthy();
    if (!partRef) return;
    expect(partRef.dc).toBeTruthy();
    if (partRef.dc) expect(partRef.dc.externalReferences[0]).toBe("value");
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

  const context = { componentFile: cf, component: c, styleElements: [], partRef: undefined as PartReference | undefined };
  context.partRef = processMxtWith(context, el);

  return context;
}

