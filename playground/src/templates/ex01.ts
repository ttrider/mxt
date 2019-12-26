import { autorun } from "mobx";
const t01$$template = document.createElement("template");
t01$$template.innerHTML = `
    <div id="tagid_4">Hello MXT!</div>
  `;
export function t01(data: any, host?: null | undefined | Element) {

  return create(data, host).element;


  function create(data: any, host?: null | undefined | Element) {

    const component = document.importNode(t01$$template, true);
    const tagid_4$$element = component.content.getElementById("tagid_4");
    if (!tagid_4$$element)
      throw new Error("missing element: @tagid_4");
    tagid_4$$element.id = "old";
    tagid_4$$element.addEventListener("click", tagid_4$$click)
    const tagid_4$$autorun = autorun(() => {
      const { color } = data;
      tagid_4$$element.setAttribute("style", `color: ${color}`)
    });
    if (host)
      host.appendChild(component.content);

    return {
      element: component.content,
      delete: () => {
        component.content.parentElement?.removeChild(component.content);

        tagid_4$$autorun();
        tagid_4$$element.removeEventListener("click", tagid_4$$click);
      }
    };

    function tagid_4$$click(ev: Event) {
      ev.preventDefault()
    }
  }


}
