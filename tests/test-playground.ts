import { codegenSetup } from "./utils";
import path from "path";
import fs, { readFileSync, writeFileSync } from "fs";

const {parseWithComments} = require('jest-docblock');

const code = `
/**
 * This is a sample
 *
 * @flow foo
 * @bar [a,b,c]
 */
 
 console.log('Hello World!');
`;
 
const parsed = parseWithComments(code);

// prints an object with two attributes: comments and pragmas.
console.log(parsed);

describe("playground", () => {

  test("ex01", () => {
    const results = processTemplate("ex01"); 
    expect(results).toMatchSnapshot();
  });

  test("ex02", () => {
    const results = processTemplate("ex02");
    expect(results).toMatchSnapshot();
  });
  test("ex03", () => {
    const results = processTemplate("ex03");
    expect(results).toMatchSnapshot();
  });

});

function processTemplate(name: string) {

  const dir = path.resolve(__dirname, "..", "playground", "src", "templates");
  const inputFile = path.resolve(dir, name + ".html");
  const outputFile = path.resolve(dir, name + ".ts");

  const buffer = readFileSync(inputFile);
  if (buffer) {
    const results = codegenSetup(buffer.toString());
    writeFileSync(outputFile, results);

    return results;
  }

}
