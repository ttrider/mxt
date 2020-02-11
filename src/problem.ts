import { Element } from "domhandler";

export enum ProblemCode {
    INFO000, // Unknown 

    ERR001, // Duplicate template id
    ERR002, // Missing template id
    ERR003, // Invalid tag

    ERR004, // missing "from" attribute in mxt.import element
    ERR005, // missing "from" attribute in mxt.import element
}

const msgTemplates = [
    template`OK`,
    template`Duplicate template id '${"id"}'`,
    template`Missing template id`,
    template`Invalid tag '${"name"}'`,
    template`mxt.import: missing required "from" attribute`,
    template`mxt.import: either "name" or "as" is required`,


]


export class Problem extends Error {

    code: ProblemCode = ProblemCode.INFO000;
    startIndex?: number | null;
    endIndex?: number | null;


    private constructor(message?: string) {
        super(message);
    }

    static fromElement(code: ProblemCode, element: Element) {

        const message = msgTemplates[code](element);

        const p = new Problem(message);
        p.name = ProblemCode[code];
        p.code = code;
        p.startIndex = element.startIndex;
        p.endIndex = element.endIndex;

        return p;
    }
}



function template(strings, ...keys) {
    return (function (...values) {
        let dict = values[values.length - 1] || {};
        let result = [strings[0]];
        keys.forEach(function (key, i) {
            let value = Number.isInteger(key) ? values[key] : dict[key];
            result.push(value, strings[i + 1]);
        });
        return result.join('');
    });
}


