import { autorun } from "mobx";
const t01$$template = document.createElement("template");
t01$$template.innerHTML = `
    <div id="tagid_3">Hello MXT!</div>
  `;
export function t02(data: any, host?: null | undefined | Element) {
    let disposed = false;
    const { $$elements, tagid_3$$element } = $$mxt$$initialize$$(t01$$template, ["tagid_3"]);
    tagid_3$$element.id = "old";
    tagid_3$$element.addEventListener("click", tagid_3$$click);
    const tagid_3$$autorun = autorun(() => {
        const { color } = data;
        tagid_3$$element.setAttribute("style", `color: ${color}`);
    });
    if (host)
        $$mxt$$appendTo$$($$elements, host);
    return {
        get disposed() { return disposed; },
        get elements() { return $$elements; },
        appendTo: (host: Element) => $$mxt$$appendTo$$($$elements, host),
        remove: () => $$mxt$$remove$$($$elements),
        dispose: () => {
            disposed = true;
            $$mxt$$remove$$($$elements);
            $$elements.splice(0, $$elements.length);
            tagid_3$$element.removeEventListener("click", tagid_3$$click);
            tagid_3$$autorun();
        }
    };
    function tagid_3$$click(ev: Event) {
        const { doClick } = data;
        doClick(ev);
    }
}
function $$mxt$$initialize$$(template: HTMLTemplateElement, elementIds: string[]) {
    const elements: Element[] = [];
    let child = template.content.firstElementChild;
    while (child) {
        elements.push(child);
        child = child.nextElementSibling;
    }
    const context: any = { $$elements: elements };
    for (const elementId of elementIds) {
        {
            const element = template.content.getElementById(elementId);
            if (element) {
                context[elementId + "$$element"] = element;
            }
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
