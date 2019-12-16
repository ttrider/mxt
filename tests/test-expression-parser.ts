import { parseExpressions } from "../src";

import template from "babel-template";
import traverse, { Scope } from "babel-traverse";
import * as t from "babel-types";
import { parseSync } from "@babel/core";
import { parse } from "babylon";




test("null expression", () => {

    const results = parseExpressions("abc");
    expect(results).toStrictEqual({ content: "abc", originalContent: "abc" });
});

test("simple value expression", () => {

    const results = parseExpressions("${abc}");
    expect(results).toStrictEqual({ content: "${abc}", originalContent: "${abc}", external:["abc"] });

});

test("multiple value expressions", () => {

    const results = parseExpressions("abc${def}ghi${jkl}");
    expect(results).toStrictEqual({ content: "abc${def}ghi${jkl}", originalContent: "abc${def}ghi${jkl}", external:["def","jkl"] });

});

test("expression with functions", () => {

    const results = parseExpressions("${function(a){return a*b*c;}(d)}");
    expect(results).toStrictEqual({ content: "${function(a){return a*b*c;}(d)}", originalContent: "${function(a){return a*b*c;}(d)}", external:["b","c","d"] });

});