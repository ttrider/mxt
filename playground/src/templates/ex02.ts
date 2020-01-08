import { autorun } from "mobx";
const ex02$$template = document.createElement("template");
ex02$$template.innerHTML = "\n    <div id=\"tagid_2\">Hello MXT!</div>\n";
export function ex02(data: any, host?: null | undefined | Element) {
    let disposed = false;
    const { $$mxt$$elements$$, tagid_2$$element } = $$mxt$$initialize$$(ex02$$template, ["tagid_2"]);
    tagid_2$$element.id = "";
    tagid_2$$element.addEventListener("click", tagid_2$$click);
    const tagid_2$$autorun = autorun(() => {
        const { color } = data;
        tagid_2$$element.setAttribute("style", `color: ${color}`);
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
            tagid_2$$element.removeEventListener("click", tagid_2$$click);
            tagid_2$$autorun();
        }
    };
    function tagid_2$$click(ev: Event) {
        const { colorClick } = data;
        colorClick.bind(data)(ev);
    }
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
