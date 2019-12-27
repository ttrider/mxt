import { autorun } from "mobx";

const t01$$template = document.createElement("template");
t01$$template.innerHTML = `
    <div id="tagid_4">Hello MXT!</div>
    <div id="tagid_5">Hello MXT too!</div>
  `;
export function t01(data: { color: any, title: any }, host?: null | undefined | Element) {
  let disposed = false;

  const { $$elements, tagid_4$$element, tagid_5$$element } = $$mxt$$initialize$$(t01$$template, "tagid_4", "tagid_5");

  tagid_4$$element.id = "";
  const tagid_4$$autorun = autorun(() => {
    const { color } = data;
    tagid_4$$element.setAttribute("style", `color: ${color};`)
  });

  tagid_5$$element.id = "";
  const tagid_5$$autorun = autorun(() => {
    const { title } = data;
    tagid_5$$element.setAttribute("title", `${title}`)
  });
  if (host)
    $$mxt$$appendTo$$($$elements, host);

  return {
    elements: $$elements,
    get disposed() { return disposed },

    appendTo: (host: Element) => $$mxt$$appendTo$$($$elements, host),
    remove: () => $$mxt$$remove$$($$elements),

    dispose: () => {
      disposed = true;
      $$mxt$$remove$$($$elements);
      $$elements.splice(0, $$elements.length);
      tagid_4$$autorun();
      tagid_5$$autorun();
    }
  };
}

function $$mxt$$initialize$$(template: HTMLTemplateElement, ...elementIds: string[]) {

  const elements: Element[] = [];
  let c = template.content.firstElementChild;
  while (c) {
    elements.push(c);
    c = c.nextElementSibling;
  }

  const context: any = {
    $$elements: elements
  }

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