import { parseTemplate } from "../src/template-handler";
import { setupElementTest } from "./utils";
import { parseSync } from "@babel/core";

test("simple template", () => {

  const input =
    `<TEMplaTe id="t01" type="mxt">
    <div style="color: \${color}">Hello MXT!</div>
  </template>`;


  const { context, component, element } = setupElementTest(input)

  expect(parseTemplate(context, component, element)).toBe(true);





  const test00 = "`abc${a+b}def`";

  const results = parseSync(test00, {
    filename: "./test",
    ast: true,
    code: true,
    minified: true,
    compact: true
  });

  console.info(results);



  //expect(context.globalLinkElements.length).toBe(0);
});

