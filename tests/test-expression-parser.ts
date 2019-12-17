import { parseExpressions } from "../src";


test("null expression", () => {
 
    const results = parseExpressions("abc");
    expect(results).toStrictEqual({ content: "abc", hasTokens: false, externalReferences: [] });
});
 
test("simple value expression", () => {
 
    const results = parseExpressions("${abc}");
    expect(results).toStrictEqual({ content: "${abc}", hasTokens: true, externalReferences: ["abc"] });
});

test("multiple value expressions", () => {
 
    const results = parseExpressions("abc${def}ghi${jkl}");
    expect(results).toStrictEqual({ content: "abc${def}ghi${jkl}", hasTokens: true, externalReferences: ["def", "jkl"] });

});

test("expression with functions", () => {
 
    const results = parseExpressions("${function(a){return a*b*c;}(d)}");
    expect(results).toStrictEqual({ content: "${function(a){return a*b*c;}(d)}", hasTokens: true, externalReferences: ["b", "c", "d"] });
});