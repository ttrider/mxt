
import { templateTestSetup } from "./utils";

test("simple template", () => {

  const input =
    `<template id="t01" type="mxt">
    <div id="old" style="color: \${color}">Hello MXT!</div>
  </template>`;

  const { template, dynamicElement } = templateTestSetup(input, "t01");

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

    const { template, dynamicElement } = templateTestSetup(input, "t01");

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

    const { template, dynamicElement } = templateTestSetup(input, "t01");

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

    const { template, dynamicElement } = templateTestSetup(input, "t01");

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

    const { template, dynamicElement } = templateTestSetup(input, "t01");

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

    const { template, dynamicElement } = templateTestSetup(input, "t01");

    expect(dynamicElement).toBeUndefined();
  });

  test("unexpected event", () => {

    const input =
      `<template id="t01" type="mxt">
    <div mxt.someevent="foo" mxt.click="doClick" >Hello MXT!</div>
  </template>`;

    const { template, dynamicElement } = templateTestSetup(input, "t01");

    expect(dynamicElement).not.toBeUndefined();
    expect(dynamicElement.events).not.toHaveProperty("someevent");
  });

});

describe("mxt.if", () => {

  test("simple if", () => {

    const input =
      `<template id="t01" type="mxt">
      <mxt.if condition="${true}">
        <div>YES!</div>
      </mxt-if>
    </template>`;

    const { template, dynamicElement } = templateTestSetup(input, "t01");

  });
});

describe("mxt.switch", () => {

  test("simple switch", () => {

    const input =
      `<template id="t01" type="mxt">
      <mxt.if condition="${true}">
        <div>YES!</div>
      </mxt-if>
    </template>`;

    const { template, dynamicElement } = templateTestSetup(input, "t01");

  });


  // <mxt.switch condition="">
  //       <mxt.case value="" when="">
  //       </mxt.case>
  //       <mxt.case value="" when="">
  //       </mxt.case>
  //       <mxt.default>
  //       </mxt.default>
  //     </mxt.switch>

});