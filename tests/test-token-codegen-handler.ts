import { codegenSetup } from "./utils";
import path from "path";
import fs from "fs";

describe("token", () => {

  const logs: string[] = [];

  afterAll(() => {

    if (logs.length > 0) {

      const filename = path.resolve(__dirname, "__snapshots__", path.basename(__filename) + ".log");
      fs.writeFileSync(filename, logs.join("\n=======================\n\n"));

    }
  });

  test("single element, attribute, token", () => {

    const input =
      `<template id="t01" type="mxt">
    <div id="old" style="color: \${color}">Hello MXT!</div>
  </template>`;


    const results = codegenSetup(input);

    expect(results).toMatchSnapshot();

  });

  test("single element, multiple attributes,tokens", () => {

    const input =
      `<template id="t01" type="mxt">
    <div id="old" style="color: \${color}" title="\${title}">Hello MXT!</div>
  </template>`;

    const results = codegenSetup(input);
    expect(results).toMatchSnapshot();

  });

  test("single element, multiple tokens per attribute", () => {

    const input =
      `<template id="t01" type="mxt">
    <div id="old" style="color: \${color}; margin: \${margin}" >Hello MXT!</div>
  </template>`;

    const results = codegenSetup(input);

    expect(results).toMatchSnapshot();
  });

  test("multiple elements", () => {
    const input =
      `<template id="t01" type="mxt">
    <div style="color: \${color};">Hello MXT!</div>
    <div title="\${title}">Hello MXT too!</div>
  </template>`;

    const results = codegenSetup(input);

    logs.push(results);
    

    expect(results).toMatchSnapshot();
  })


});
