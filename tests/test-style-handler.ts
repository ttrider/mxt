import processStyle from "../src/defaultHandlers/style-handler";

test("component style", async () => {

  const input = `.foo { color: white;}`;
  const output =
    `.\${$cid}  .foo {
  color: white;
}`;

  const results = await processStyle(input);
  expect(results.componentStyle).not.toBeFalsy();
  expect(results.dynamicStyle).toBeFalsy();
  expect(results.globalStyle).toBeFalsy();
  if (results.componentStyle) expect(results.componentStyle.content).toBe(output);
});

test("global style", async () => {

  const input = `.foo { color: white;}`;
  const output = `.foo { color: white;}`;

  const results = await processStyle(input, undefined, true);
  expect(results.componentStyle).toBeFalsy();
  expect(results.dynamicStyle).toBeFalsy();
  expect(results.globalStyle).not.toBeFalsy();
  if (results.globalStyle) expect(results.globalStyle.content).toBe(output);
});

test("dynamic style", async () => {

  const input = `.foo { color: \${color};}`;
  const output =
    `.\${$iid}  .foo {
  color: \${color};
}`;

  const results = await processStyle(input);
  expect(results.componentStyle).toBeFalsy();
  expect(results.dynamicStyle).not.toBeFalsy();
  expect(results.globalStyle).toBeFalsy();
  if (results.dynamicStyle) {
    expect(results.dynamicStyle.content).toBe(output);
    expect(results.dynamicStyle.references).toStrictEqual(["color"]);
  }
});


test("LESS component style", async () => {

  const input = `.foo { color: white; .bar { color: black;}}`;
  const output =
    `.\${$cid}  .foo {
  color: white;
}
.\${$cid}  .foo .bar {
  color: black;
}
`;

  const results = await processStyle(input, "less");
  expect(results.componentStyle).not.toBeFalsy();
  expect(results.dynamicStyle).toBeFalsy();
  expect(results.globalStyle).toBeFalsy();
  if (results.componentStyle) {
    expect(results.componentStyle.content).toStrictEqual(output);
  }


  const results2 = await processStyle(input, "text/less");
  expect(results2.componentStyle).not.toBeFalsy();
  expect(results2.dynamicStyle).toBeFalsy();
  expect(results2.globalStyle).toBeFalsy();
  if (results2.componentStyle) {
    expect(results2.componentStyle.content).toStrictEqual(output);
  }


});


test("LESS global style", async () => {

  const input = `.foo { color: white; .bar { color: black;}}`;
  const output =
    `.foo {
  color: white;
}
.foo .bar {
  color: black;
}
`;

  const results = await processStyle(input, "less", true);
  expect(results.componentStyle).toBeFalsy();
  expect(results.dynamicStyle).toBeFalsy();
  expect(results.globalStyle).not.toBeFalsy();
  if (results.globalStyle) expect(results.globalStyle.content).toBe(output);
});

test("LESS dynamic style", async () => {

  const input = `.foo { color: \${color}; .bar { color: \${color2};}}`;
  const output =
    `.\${$iid}  .foo {
  color: \${color};
}
.\${$iid}  .foo .bar {
  color: \${color2};
}`;

  const results = await processStyle(input, "less");
  expect(results.componentStyle).toBeFalsy();
  expect(results.dynamicStyle).not.toBeFalsy();
  expect(results.globalStyle).toBeFalsy();
  if (results.dynamicStyle) {

    expect(results.dynamicStyle.content.trim()).toBe(output.trim());
    expect(results.dynamicStyle.references).toStrictEqual(["color", "color2"]);
  }
});


test("SCSS component style", async () => {

  const input = `.foo { 
    color: white; 
    .bar { 
      color: black;
    }
  }`;
  const output =
    `.\${$cid}  .foo {
  color: white;
}
.\${$cid}  .foo .bar {
  color: black;
}`;

  const results = await processStyle(input, "scss");
  expect(results.componentStyle).not.toBeFalsy();
  expect(results.dynamicStyle).toBeFalsy();
  expect(results.globalStyle).toBeFalsy();
  if (results.componentStyle) {
    expect(results.componentStyle.content).toStrictEqual(output);
  }

});


test("SASS global style", async () => {

  const input = `.foo
    color: white
    .bar
      color: black
      `;
  const output =
    `.foo {
  color: white;
}
.foo .bar {
  color: black;
}
`;

  const results = await processStyle(input, "sass", true);
  expect(results.componentStyle).toBeFalsy();
  expect(results.dynamicStyle).toBeFalsy();
  expect(results.globalStyle).not.toBeFalsy();
  if (results.globalStyle) {

    console.info(results.globalStyle.content.split("\n").join("\\n"));
    console.info(output.split("\n").join("\\n"));

    expect(results.globalStyle.content.trim()).toBe(output.trim());

  }
});



