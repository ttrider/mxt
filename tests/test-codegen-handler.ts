import { parseTemplate } from "../src/defaultHandlers/template-handler";
import { codegen } from "../src/defaultHandlers/codegen-handler";
import { setupElementTest } from "./utils";
import { generateFromAst } from "../src/ast/generator";

describe("token", () => {

  test("single element, attribute, token", () => {

    const input =
      `<template id="t01" type="mxt">
    <div id="old" style="color: \${color}">Hello MXT!</div>
  </template>`;

    expect(setup(input)).toMatchSnapshot();
  });

  test("single element, multiple attributes,tokens", () => {

    const input =
      `<template id="t01" type="mxt">
    <div id="old" style="color: \${color}" title="\${title}">Hello MXT!</div>
  </template>`;

    expect(setup(input)).toMatchSnapshot();
  });

  test("single element, multiple tokens per attribute", () => {

    const input =
      `<template id="t01" type="mxt">
    <div id="old" style="color: \${color}; margin: \${margin}" >Hello MXT!</div>
  </template>`;

    expect(setup(input)).toMatchSnapshot();
  });

  test("multiple elements", () => {

    const input =
      `<template id="t01" type="mxt">
    <div style="color: \${color};">Hello MXT!</div>
    <div title="\${title}">Hello MXT too!</div>
  </template>`;

    expect(setup(input)).toMatchSnapshot();
  })


  function setup(content: string) {
    const { context, component, element } = setupElementTest(content);

    expect(parseTemplate(context, component, element)).toBe(true);
    expect(codegen(context, component)).toBe(true);
    return generateFromAst(component.getStatements());
  }
});
