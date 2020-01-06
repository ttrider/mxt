import { autorun } from "mobx";
const ex03$$template = document.createElement("template");
ex03$$template.innerHTML = `

    <style>
        div {
            background: #f0f0f0;
            cursor: pointer;
            box-sizing: content-box;
        }

        div:hover {
            background: #e0e0f0;
        }
    </style>

    <div id="tagid_3">Hello MXT!</div>
`;
export function ex03(data: any, host?: null | undefined | Element) {
    let disposed = false;
    const { $$mxt$$elements$$, tagid_3$$element } = $$mxt$$initialize$$(ex03$$template, ["tagid_3"]);
    tagid_3$$element.id = "";
    tagid_3$$element.addEventListener("click", tagid_3$$click);
    const tagid_3$$autorun = autorun(() => {
        const { color } = data;
        tagid_3$$element.setAttribute("style", `color: ${color}`);
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
            tagid_3$$element.removeEventListener("click", tagid_3$$click);
            tagid_3$$autorun();
        }
    };
    function tagid_3$$click(ev: Event) {
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
