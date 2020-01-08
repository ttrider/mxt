import { autorun } from "mobx";
const ex01$$template = document.createElement("template");
ex01$$template.innerHTML = "\n    <div id=\"tagid_1\">Hello MXT!</div>\n";
export function ex01(data: any, host?: null | undefined | Element) {
    let disposed = false;
    const { $$mxt$$elements$$, tagid_1$$element } = $$mxt$$initialize$$(ex01$$template, ["tagid_1"]);
    tagid_1$$element.id = "";
    const tagid_1$$autorun = autorun(() => {
        const { color } = data;
        tagid_1$$element.setAttribute("style", `color: ${color}`);
    });
    if (host)
        $$mxt$$appendTo$$($$mxt$$elements$$, host);
    return {
        get disposed() {
            return disposed;
        },
        get elements() {
            return $$mxt$$elements$$;
        },
        appendTo: (host: Element) => $$mxt$$appendTo$$($$mxt$$elements$$, host),
        remove: () => $$mxt$$remove$$($$mxt$$elements$$),
        dispose: () => {
            disposed = true;
            $$mxt$$remove$$($$mxt$$elements$$);
            $$mxt$$elements$$.splice(0, $$mxt$$elements$$.length);
            tagid_1$$autorun();
        }
    };
}
function $$mxt$$initialize$$(template: HTMLTemplateElement, elementIds: string[]) {
    const elements: Element[] = [];
    let child = template.content.firstElementChild;
    while (child) {
        elements.push(child);
        child = child.nextElementSibling;
    }
    const context: any = { $$mxt$$elements$$: elements };
    for (const elementId of elementIds) {
        const element = template.content.getElementById(elementId);
        if (element) {
            context[elementId + "$$element"] = element;
        }
    }
    return context;
}
function $$mxt$$appendTo$$(elements: Element[], host: Element) {
    for (const el of elements) {
        host.appendChild(el);
    }
}
function $$mxt$$remove$$(elements: Element[]) {
    for (const el of elements) {
        el.remove();
    }
}
