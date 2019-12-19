import { autorun } from "mobx";
const t01$$template = document.createElement("template");
t01$$template.innerHTML = `
    <div id="tagid_1">Hello MXT!</div>
  `;
export function t01(data: any, host?: null | undefined | Element) {
  const component = document.importNode(t01$$template, true);
  const tagid_1$$element = component.content.getElementById("tagid_1");
  if (!tagid_1$$element) throw new Error("missing element: @tagid_1");
  tagid_1$$element.id = "old";
  autorun(() => {
    const {
      color
    } = data;
    tagid_1$$element.setAttribute("style", `color: ${color}`);
  });
  if (host) host.appendChild(component.content);
  return component.content;
}