import { Element } from "domhandler";

export enum ProblemCode {
    INFO000, // Unknown 

    ERR001, // Duplicate template id
    ERR002, // Missing template id
    ERR003, // Invalid tag

    ERR004, // missing "from" attribute in mxt.import element
    ERR005, // missing "from" attribute in mxt.import element

    ERR006, // missing "data" attribute in mxt.with element

    ERR007, // missing "name" attribute in mxt.component element
    ERR008, // missing "as" attribute in mxt.component element

    ERR009, // missing "condition" attribute in mxt.if element
    ERR010, // unexpected child element
    ERR011, // missing required attribute "when"

    ERR012, // missing required attribute "in"

    
}

const msgTemplates = [
    template`OK`,
    template`Duplicate template id '${"id"}'`,
    template`Missing template id`,
    template`Invalid tag '${"_name"}'`,
    template`mxt.import: missing required attribute: "from"`,
    template`mxt.import: either "name" or "as" is required`,
    template`mxt.with: missing required attribute: "data"`,
    template`mxt.component: missing required attribute: "name"`,
    template`mxt.component: neither "as" nor "name" attribute with "from"`,
    template`mxt.if: missing required attribute: "condition"`,
    template`mxt.switch: unexpected child element '${"_name"}'`,
    template`mxt.case: missing required attribute: "when"`,
    template`mxt.foreach: missing required attribute: "in"`,

]


export class Problem extends Error {

    code: ProblemCode = ProblemCode.INFO000;
    startIndex?: number | null;
    endIndex?: number | null;


    private constructor(message?: string) {
        super(message);
    }

    static fromElement(code: ProblemCode, element: Element) {

        const params = { ...element.attribs, _name: element.name };

        const message = msgTemplates[code](params);

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


