import fs, { writeFileSync } from "fs";
import path from "path";
import util from "util";
const writeFile = util.promisify(fs.writeFile);

test("generate", () => {

    const lines: string[] = [];
    lines.push(`describe("parse:element", () => {`);

    const aa = ["a1", "a2", "a3"];

    for (let index = 0; index < aa.length; index++) {
        const a = aa[index];
        lines.push(`test("${a}", () => { expect("${a}").toBe("${a}"); expect("${a}").toMatchSnapshot(); });`);
    }

    lines.push(`});`);

    const outputFile = path.resolve(__dirname, "./element.ts");
    writeFileSync(outputFile, lines.join("\n"));

});
