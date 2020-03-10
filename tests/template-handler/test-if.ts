import { ComponentFile } from "../../src/component-file";
import { processMxtIf } from "../../src/defaultHandlers/template-handler";
import { Element } from "domhandler";
import { Component } from "../../src/component";
import { PartReference, SwitchSequencePart } from "../../src/template-parts";

describe("msx-if", () => {

  test("import from as", () => {
    const { component, partRef } = createInputElement("mxt.if", { condition: "${value==1}" });

    expect(partRef).toBeTruthy(); if (!partRef) return;
    expect(partRef.partId).toBeTruthy(); if (!partRef.partId) return;

    const part = component.partset[partRef.partId] as SwitchSequencePart;
    expect(part).toBeTruthy(); if (!part) return;

    expect(part.sequence).toBeTruthy(); if (!part.sequence) return;
    expect(part.sequence.length).toBeTruthy(); if (!part.sequence) return;

    expect(part.sequence[0].when).toBeTruthy(); if (!part.sequence[0].when) return;
    expect(part.sequence[0].when.externalReferences[0]).toBe("value");
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
  context.partRef = processMxtIf(context, el);

  return context;
}

