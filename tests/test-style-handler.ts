import { parseStyle } from "../src/defaultHandlers/style-handler";
import { setupElementTest } from "./utils";

test("invalid element type", () => {

  const { context, component, element } = setupElementTest(`<somelement></somelement>`)

  expect(parseStyle(context, component, element)).toBe(false);

  expect(context.globalLinkElements.length).toBe(0);
});


test("valid global link", () => {

  const { context, component, element } = setupElementTest(`<link href="foo" rel="stylesheet"/>`)

  expect(parseStyle(context, component, element)).toBe(true);
  expect(component.links.length).toBe(1);

  expect(component.links).toContainEqual({
    name: "link",
    attributes: {
      rel: "stylesheet",
      href: "foo"
    }
  })
});


test("empty style", () => {

  const { context, component, element } = setupElementTest(`<style></style>`)

  expect(parseStyle(context, component, element)).toBe(true);

  expect(component.globalStyles).toContainEqual({
    name: "style",
    rules: [],
    attributes: {}
  });
});

test("simple style", () => {

  const { context, component, element } = setupElementTest(`<style>.a{color:red;}</style>`)

  expect(parseStyle(context, component, element)).toBe(true);

  expect(component.globalStyles.length).toBe(1);

  expect(component.globalStyles).toContainEqual({
    name: "style",
    attributes: {},
    expressions: [],
    rules: [],
    content: `.a{color:red;}`
  })
});

test("style with expressions", () => {

  const { context, component, element } = setupElementTest(`<style>.a{color:\${red};}</style>`)

  expect(parseStyle(context, component, element)).toBe(true);

  expect(component.globalStyles.length).toBe(1);

  expect(component.globalStyles).toContainEqual({
    name: "style",
    attributes: {},
    expressions: ["red"],
    rules: [],
    content: `.a{color:\${red};}`
  })

});


test("complex style", () => {

  const complexStyle = `

  @charset "UTF-8";
  
  @font-face {
    font-family: myFirstFont;
    src: url(sansation_light.woff);
  }
  
  @import "navigation.css"; /* Using a string */

  @import url("navigation.css"); /* Using a url */

  @keyframes mymove {
    from {top: 0px;}
    to {top: 200px;}
  }

  @media only screen and (max-width: 600px) {
    body {
      background-color: lightblue;
    }
  }



  `;


  const { context, component, element } = setupElementTest(`<style>.a{color:red;}</style>`)

  expect(parseStyle(context, component, element)).toBe(true);

  expect(component.globalStyles.length).toBe(1);

  expect(component.globalStyles).toContainEqual({
    name: "style",
    attributes: {},
    expressions: [],
    rules: [],
    content: `.a{color:red;}`
  })
});
