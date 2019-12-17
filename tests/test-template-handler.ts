import { parseTemplate } from "../src/template-handler";
import { codegen } from "../src/codegen-handler";
import { setupElementTest } from "./utils";

test("simple template", () => {

  const input =
    `<template id="t01" type="mxt">
    <div style="color: \${color}">Hello MXT!</div>
  </template>`;

  const { context, component, element } = setupElementTest(input);

  expect(parseTemplate(context, component, element)).toBe(true);
 
  codegen(context, component);

});

