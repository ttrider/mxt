import { codegenSetup } from "./utils";
import path from "path";
import fs from "fs";

describe("events", () => {

  const logs: string[] = [];

  afterAll(() => {

    if (logs.length > 0) {

      const filename = path.resolve(__dirname, "__snapshots__", path.basename(__filename) + ".log");
      fs.writeFileSync(filename, logs.join("\n=======================\n\n"));

    }
  });

  test("handler", () => {

    const input =
      `<template id="t01" type="mxt">
    <div id="old" style="color: \${color}" mxt.click="doClick">Hello MXT!</div>
  </template>`;

    const results = codegenSetup(input);

    //logs.push(results); 

    expect(results).toMatchSnapshot();
  });

  test("handler and propagation functions", () => {

    const input =
      `<template id="t01" type="mxt">
    <div id="old" style="color: \${color}" mxt.click="doClick" mxt.click.preventDefault mxt.click.stopPropagation mxt.click.stopImmediatePropagation>Hello MXT!</div>
  </template>`;

    const results = codegenSetup(input);

    //logs.push(results); 

    expect(results).toMatchSnapshot();
  });

  test("handler with options", () => {

    const input =
      `<template id="t01" type="mxt">
    <div id="old" style="color: \${color}" mxt.click="doClick" mxt.click.once mxt.click.passive mxt.click.capture>Hello MXT!</div>
  </template>`;

    const results = codegenSetup(input);

    logs.push(results); 

    expect(results).toMatchSnapshot();
  }); 
  
  
  test("no handler", () => {

    const input =
      `<template id="t01" type="mxt">
    <div id="old" style="color: \${color}" mxt.click.preventDefault>Hello MXT!</div>
  </template>`;

    const results = codegenSetup(input);

    //logs.push(results); 

    expect(results).toMatchSnapshot();
  }); 
});
