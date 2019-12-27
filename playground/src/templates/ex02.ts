import { autorun } from "mobx";
const t01$$template = document.createElement("template");
t01$$template.innerHTML = `
    <div id="tagid_1">Hello MXT!</div>
  `;
export function t01(data: any, host?: null | undefined | Element) {
    let disposed = false;
    const { $$elements, tagid_1$$element } = initialize(t01$$template, "tagid_1");
    const component = document.importNode(t01$$template, true);
    const tagid_1$$element = component.content.getElementById("tagid_1");
    if (!tagid_1$$element)
        throw new Error("missing element: @tagid_1");
    tagid_1$$element.id = "old";
    const tagid_1$$autorun = autorun(() => {
        const { color } = data;
        tagid_1$$element.setAttribute("style", `color: ${color}`)
    });
    if (host)
        host.appendChild(component.content);
    return component.content;
}
