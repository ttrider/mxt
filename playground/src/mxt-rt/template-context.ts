import * as rt from "./types";
import { autorun } from "mobx";
import Context from "./context";
import DataContext from "./data-context";
import { Part } from "./parts-context";

// Event Flags
//   preventDefault = 0x0001,
//   stopPropagation = 0x0002,
//   stopImmediatePropagation = 0x0004,
//   once = 0x0008,
//   passive = 0x0010,
//   capture = 0x0020

interface EventContext {
    element: Element;
    name: string;
    handler: (ev: Event) => void;
    options?: AddEventListenerOptions;
}

export class TemplateContext extends Context {

    elements: Element[] = [];
    events: EventContext[] = [];
    disposers: Array<() => void> = [];
    parts: Part[] = [];

    constructor(params: rt.TemplateParams, dc: DataContext, ipp: rt.InsertPointProvider) {
        super(params, dc, ipp);

        if (typeof params.template === "string") {
            const content = params.template;
            params.template = document.createElement("template");
            params.template.innerHTML = content;
        }

        let currentIpp = ipp;

        const content = params.template.content.cloneNode(true) as DocumentFragment;
        let child = content.firstElementChild;
        if (child) {
            let lastChild = child;
            while (child) {
                this.elements.push(child);
                lastChild = child;
                child = child.nextElementSibling;
            }
            currentIpp = () => { return { element: lastChild, position: "afterend" } };
        }

        if (params.attachTo) {

            for (const item of params.attachTo) {

                const element = content.getElementById(item.id);

                if (element) {

                    if (item.originalId) {
                        element.id = item.originalId;
                    } else {
                        element.removeAttribute("id");
                    }

                    if (item.attrs !== undefined || item.value !== undefined) {
                        this.disposers = this.disposers ?? [];
                        this.disposers.push(
                            autorun(() => {

                                if (item.attrs !== undefined) {
                                    const attrs = item.attrs(this.dc);
                                    for (const key in attrs) {
                                        if (attrs.hasOwnProperty(key)) {
                                            const value = attrs[key];
                                            if (value) {
                                                element.setAttribute(key, value.toString());
                                            } else {
                                                element.removeAttribute(key);
                                            }
                                        }
                                    }
                                }

                                if (item.value !== undefined) {
                                    const value = item.value(this.dc);
                                    element.innerText = value !== undefined ? value.toString() : null;
                                }
                            }));
                    }

                    if (item.events !== undefined) {
                        for (let index = 0; index < item.events.length; index++) {
                            const e = item.events[index];
                            const flags = e.flags ?? 0;
                            const eventContext: EventContext = {
                                element,
                                name: e.name,
                                handler: (ev: Event) => {
                                    e.handler(ev, this.dc);
                                    if (flags & 0x0001) ev.preventDefault();
                                    if (flags & 0x0002) ev.stopPropagation();
                                    if (flags & 0x0004) ev.stopImmediatePropagation();
                                },
                                options: {
                                    once: !!(flags & 0x0008),
                                    passive: !!(flags & 0x0010),
                                    capture: !!(flags & 0x0020),
                                }
                            };

                            element.addEventListener(eventContext.name, eventContext.handler, eventContext.options);
                            this.events.push(eventContext);
                        }
                    }

                    if (item.embed) {
                        this.parts.push(item.embed(dc, () => { return { element, position: "beforeend" } }));
                    }
                }
            }
        }


        this.tail = currentIpp;
    }

    insert() {
        if (!super.insert()) return;

        let { element, position } = this.head();

        if (element && this.elements && this.elements.length > 0) {
            let inserted = element.insertAdjacentElement(position, this.elements[0]);
            if (inserted) {
                element = inserted;
                position = "afterend";

                for (let index = 1; index < this.elements.length; index++) {
                    const el = this.elements[index];
                    inserted = element.insertAdjacentElement(position, el);
                    if (inserted) {
                        element = inserted
                    }
                }
            }
        }

        this.parts.forEach(ps => ps.insert());

        return true;
    }

    dispose() {
        this.elements = [];
        this.disposers.forEach(d => d());
        this.events.forEach(e => e.element.removeEventListener(e.name, e.handler, e.options));
        this.parts = [];
        super.dispose();
    }

    remove() {
        if (this.elements) {
            for (const el of this.elements) {
                el.remove();
            }
        }

        this.parts.forEach(ps => ps.remove());
        super.remove();
    }
}

export default TemplateContext;