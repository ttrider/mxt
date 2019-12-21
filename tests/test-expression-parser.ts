import { parseExpressions } from "../src";


test("null expression", () => {

    const results = parseExpressions("abc");
    expect(results).toMatchSnapshot();
});

test("simple value expression", () => {

    const results = parseExpressions("${abc}");
    expect(results).toMatchSnapshot();
});

test("multiple value expressions", () => {

    const results = parseExpressions("abc${def}ghi${jkl}");
    expect(results).toMatchSnapshot();
});

test("expression with functions", () => {

    const results = parseExpressions("${function(a){return a*b*c;}(d)}");
    expect(results).toMatchSnapshot();
});