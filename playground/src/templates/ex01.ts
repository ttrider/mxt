import { autorun, transaction } from "mobx";

const t01$$template = document.createElement("template");
t01$$template.innerHTML = `
    <div id$$original="" id="tagid_1">Hello MXT!</div>
  `;

// const t02$$template = document.createElement("template");
// t02$$template.innerHTML = `<div id="t01id02">Hello MXT 02!</div>`;

// const t03$$template = document.createElement("template");
// t03$$template.innerHTML = `<div id="t01id03">Hello MXT 02!</div>`;

 function t01(data: any, host?: Element | null) {

    const t01$$component = document.importNode(t01$$template, true);

    const t01$$01$$el = t01$$component.content.getElementById("t01id01");
    if (!t01$$01$$el) throw new Error("missing element: @t01id01");
    t01$$01$$el.id = ""; //or the last id

    // const t01$$02$$el = t01$$component.content.getElementById("t01id02");
    // if (!t01$$02$$el) throw new Error("missing element: @t01id02");
    // t01$$02$$el.id = ""; //or the last id

    autorun(() => {
        const { color } = data;
        t01$$01$$el.setAttribute("style", `color: ${color}`);
    });

    // autorun(() => {
    //     const { color } = data;
    //     t01$$02$$el.setAttribute("style", `color: ${color}`);
    // });


    if (host) {
        host.appendChild(t01$$component.content);
    }

    return t01$$component.content;
}

//const tt01 = t01;
export { t01 };


export function t01(data: any, host: null | undefined | Element) {
  const component = document.importNode(t01$$template, true);
  const tagid_1$$element = component.content.getElementById("tagid_1");
  if (!tagid_1$$element) throw new Error("missing element: @tagid_1");
  tagid_1$$element.id = "";
  tagid_1$$element.id$$original = "";
  autorun(tagid_1$$func);
  if (host) host.appendChild(component.content);
  if (host) host.appendChild(component.content);
  return component.content;

  function tagid_1$$func() {
    const {
      color: color
    } = data;
    tagid_1$$element.setAttribute("style", "color: ${color}");
  }
}


