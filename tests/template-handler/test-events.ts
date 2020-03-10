import { ComponentFile } from "../../src/component-file";
import processTemplate from "../../src/defaultHandlers/template-handler";
import { TemplatePart } from "../../src/template-parts";
import processComponentFile from "../../src/defaultHandlers/file-handler";

describe("msx-events", () => {

  test("simple click event", async () => {

    const input =
      `<template id="t01" type="mxt">
    <div mxt.click="doClick">Hello MXT!</div>
  </template>`;

    const { event } = await setup(input, "click");
    expect(event).toBeTruthy(); if (!event) return;

    expect(event.name).toBe("click");
    expect(event.handler).toBe("doClick");
    expect(event.preventDefault).toBeFalsy();
    expect(event.stopPropagation).toBeFalsy();
    expect(event.stopImmediatePropagation).toBeFalsy();
  });

  test("enclosed click event", async () => {

    const input =
      `<template id="t01" type="mxt">
    <div mxt.click="\${doClick}">Hello MXT!</div>
  </template>`;

    const { event } = await setup(input, "click");
    expect(event).toBeTruthy(); if (!event) return;

    expect(event.name).toBe("click");
    expect(event.handler).toBe("doClick");
    expect(event.preventDefault).toBeFalsy();
    expect(event.stopPropagation).toBeFalsy();
    expect(event.stopImmediatePropagation).toBeFalsy();
  });

  test("click event preventDefault", async () => {

    const input =
      `<template id="t01" type="mxt">
    <div mxt.click="doClick" mxt.click.preventDefault>Hello MXT!</div>
  </template>`;

    const { event } = await setup(input, "click");
    expect(event).toBeTruthy(); if (!event) return;

    expect(event.name).toBe("click");
    expect(event.handler).toBe("doClick");
    expect(event.preventDefault).toBeTruthy();
    expect(event.stopPropagation).toBeFalsy();
    expect(event.stopImmediatePropagation).toBeFalsy();
  });


  test("click event preventDefault", async () => {

    const input =
      `<template id="t01" type="mxt">
    <div mxt.click="doClick" mxt.click.preventDefault mxt.click.stopPropagation="True" mxt.click.stopImmediatePropagation="FALSE">Hello MXT!</div>
  </template>`;

    const { event } = await setup(input, "click");
    expect(event).toBeTruthy(); if (!event) return;

    expect(event.name).toBe("click");
    expect(event.handler).toBe("doClick");
    expect(event.preventDefault).toBeTruthy();
    expect(event.stopPropagation).toBeTruthy();
    expect(event.stopImmediatePropagation).toBeFalsy();
  });

  test("click event no handler", async () => {

    const input =
      `<template id="t01" type="mxt">
    <div mxt.click.preventDefault >Hello MXT!</div>
  </template>`;

    const { event } = await setup(input, "click");
    expect(event).toBeTruthy(); if (!event) return;

    expect(event.name).toBe("click");
    expect(event.preventDefault).toBeTruthy();
  });


  test("single unexpected event", async () => {

    const input =
      `<template id="t01" type="mxt">
    <div mxt.someevent="foo" >Hello MXT!</div>
  </template>`;

    const { event } = await setup(input, "someevent");
    expect(event).toBeTruthy();

  });

  test("unexpected event", async () => {

    const input =
      `<template id="t01" type="mxt">
    <div mxt.someevent="foo" mxt.click="doClick" >Hello MXT!</div>
  </template>`;

    const { event } = await setup(input, "click");
    expect(event).toBeTruthy(); if (!event) return;

    expect(event.name).toBe("click");
  });

});

async function setup(input: string, eventId: string, id: string = "t01") {

  const componentFile = ComponentFile.fromContent(input);
  processComponentFile(componentFile);
  await processTemplate(componentFile, componentFile.templates[id]);

  const component = componentFile.components[id];

  if (component.rootPart && component.rootPart.partId) {
    const part = component.partset[component.rootPart.partId] as TemplatePart;

    expect(part).toBeTruthy();
    expect(part.attachTo).toBeTruthy();

    if (part && part.attachTo && part.attachTo.length) {
      expect(part.attachTo.length).toBeTruthy();

      const events = part.attachTo[0].events;
      expect(events).toHaveProperty(eventId);

      const event = events[eventId];

      return {
        componentFile,
        component,
        part,
        event
      }
    }
  }

  return {
    componentFile,
    component
  }
}

