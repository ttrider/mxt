import { parseTemplate } from "../src/defaultHandlers/template-handler";
import { setupElementTest } from "./utils";

test("simple template", () => {

  const input =
    `<template id="t01" type="mxt">
    <div id="old" style="color: \${color}">Hello MXT!</div>
  </template>`;

  const { context, component, element } = setupElementTest(input);

  expect(parseTemplate(context, component, element)).toBe(true);
  expect(component.templates["t01"]).not.toBeUndefined();
});

