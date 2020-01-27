
import { dynamicElementTestSetup, formatComponentFileObject } from "./utils";
import { ComponentFile } from "../src/component-file";
import path from "path";
import processComponentFile from "../src/defaultHandlers/file-handler";
import processTemplate from "../src/defaultHandlers/template-handler";


let a:string;
test((a = "simple template", a), () => {

  const input =
    `<template id="t01" type="mxt">
    <div id="old" style="color: \${color}">Hello MXT!</div>
  </template>`;

  const cf = ComponentFile.fromContent(input);
  expect(processComponentFile(cf)).toBe(true);
  expect(processTemplate(cf, "t01")).toBe(true);
  const component = cf.components["t01"];
  const part = component.parts[component.rootPart];
  const dynamicElement = Object.values(part.dynamicElements)[0];


  expect(dynamicElement.originalId).toBe("old");
  expect(dynamicElement.attributes["style"]).toBeDefined();
  const attr = dynamicElement.attributes["style"];
  expect(attr.externalReferences).toContain("color");

});

describe("events", () => {

  test("simple click event", () => {

    const input =
      `<template id="t01" type="mxt">
    <div mxt.click="doClick">Hello MXT!</div>
  </template>`;

    const { dynamicElement } = dynamicElementTestSetup(input, "t01");

    expect(dynamicElement.events).toHaveProperty("click");

    const clickEvent = dynamicElement.events["click"];

    expect(clickEvent.name).toBe("click");
    expect(clickEvent.handler).toBe("doClick");
    expect(clickEvent.preventDefault).toBeFalsy();
    expect(clickEvent.stopPropagation).toBeFalsy();
    expect(clickEvent.stopImmediatePropagation).toBeFalsy();
  });


  test("enclosed click event", () => {

    const input =
      `<template id="t01" type="mxt">
    <div mxt.click="\${doClick}">Hello MXT!</div>
  </template>`;

    const { dynamicElement } = dynamicElementTestSetup(input, "t01");

    expect(dynamicElement.events).toHaveProperty("click");

    const clickEvent = dynamicElement.events["click"];

    expect(clickEvent.name).toBe("click");
    expect(clickEvent.handler).toBe("doClick");
    expect(clickEvent.preventDefault).toBeFalsy();
    expect(clickEvent.stopPropagation).toBeFalsy();
    expect(clickEvent.stopImmediatePropagation).toBeFalsy();
  });

  test("click event preventDefault", () => {

    const input =
      `<template id="t01" type="mxt">
    <div mxt.click="doClick" mxt.click.preventDefault>Hello MXT!</div>
  </template>`;

    const { dynamicElement } = dynamicElementTestSetup(input, "t01");

    expect(dynamicElement.events).toHaveProperty("click");

    const clickEvent = dynamicElement.events["click"];

    expect(clickEvent.name).toBe("click");
    expect(clickEvent.handler).toBe("doClick");
    expect(clickEvent.preventDefault).toBeTruthy();
    expect(clickEvent.stopPropagation).toBeFalsy();
    expect(clickEvent.stopImmediatePropagation).toBeFalsy();
  });


  test("click event preventDefault", () => {

    const input =
      `<template id="t01" type="mxt">
    <div mxt.click="doClick" mxt.click.preventDefault mxt.click.stopPropagation="True" mxt.click.stopImmediatePropagation="FALSE">Hello MXT!</div>
  </template>`;

    const { dynamicElement } = dynamicElementTestSetup(input, "t01");

    expect(dynamicElement.events).toHaveProperty("click");

    const clickEvent = dynamicElement.events["click"];

    expect(clickEvent.name).toBe("click");
    expect(clickEvent.handler).toBe("doClick");
    expect(clickEvent.preventDefault).toBeTruthy();
    expect(clickEvent.stopPropagation).toBeTruthy();
    expect(clickEvent.stopImmediatePropagation).toBeFalsy();
  });

  test("click event no handler", () => {

    const input =
      `<template id="t01" type="mxt">
    <div mxt.click.preventDefault >Hello MXT!</div>
  </template>`;

    const { dynamicElement } = dynamicElementTestSetup(input, "t01");

    expect(dynamicElement.events).toHaveProperty("click");

    const clickEvent = dynamicElement.events["click"];

    expect(clickEvent.name).toBe("click");
    expect(clickEvent.preventDefault).toBeTruthy();
  });


  test("single unexpected event", () => {

    const input =
      `<template id="t01" type="mxt">
    <div mxt.someevent="foo" >Hello MXT!</div>
  </template>`;

    const { dynamicElement, component } = dynamicElementTestSetup(input, "t01");



    expect(dynamicElement).toBeUndefined();
  });

  test("unexpected event", () => {

    const input =
      `<template id="t01" type="mxt">
    <div mxt.someevent="foo" mxt.click="doClick" >Hello MXT!</div>
  </template>`;

    const { dynamicElement } = dynamicElementTestSetup(input, "t01");

    expect(dynamicElement).not.toBeUndefined();
    expect(dynamicElement.events).not.toHaveProperty("someevent");
  });



});

