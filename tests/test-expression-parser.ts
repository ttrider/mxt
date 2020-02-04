import { parseInlineExpressions } from "../src/ast/ts";

test("null expression", () => {

    const results = parseInlineExpressions("abc");
    expect(results).toMatchSnapshot();
}); 

test("simple value expression", () => {

    const results = parseInlineExpressions("${abc}");
    expect(results).toMatchSnapshot();

});

test("multiple value expressions", () => {

    const results = parseInlineExpressions("abc${def}ghi${jkl}");
    expect(results).toMatchSnapshot();
});

test("expression with functions", () => {

    const results = parseInlineExpressions("${function(a){return a*b*c;}(d)}");
    expect(results).toMatchSnapshot();
});


