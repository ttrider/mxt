import { tokenizedContent, parseInlineExpressions } from "../src/ast/ts";

test("null expression", () => {

    for (const val of [
        "abc",
        "${abc}",
        "abc${def}ghi${jkl}",
        "${function(a){return a*b*c;}(d)}"
    ]) {
        const results = parseInlineExpressions(val);
        const tc = tokenizedContent(results); 
        expect(tc.resolved).toBe(val);
    }
});

test("append expression", () => {

    const original = ".foo { color: white; } .bar { color:black;}";

    const results = parseInlineExpressions(original);
    const tc = tokenizedContent(results);
    const id = tc.addToken("${cid}");
    tc.content = id + " " + tc.content;

    expect(tc.resolved).toBe("${cid} " + original);
});
