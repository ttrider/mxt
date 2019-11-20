import { Element } from "domhandler";
import handler from "../src/style-handler";
import { HandlerContext } from "../src";


test("default style handler", () => {

  expect(
    handler({
      element: new Element("foo", {})
    })).toBe(false);


});