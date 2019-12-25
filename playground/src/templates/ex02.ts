import { autorun } from "mobx";

const template = `<div id="t01id01">Hello MXT!</div>`;

// initialize 
const te = document.createElement("template");
te.innerHTML = template;


export function init(data: any) {

    const el = document.importNode(te, true);

    const d01 = el.content.getElementById("t01id01");
    if (!d01) throw new Error("missing element");
    d01.id = "";

    // set or update style
    autorun(() => {
        d01.setAttribute("style", `color: ${data.color}`);
    });

    // wiring in the click
    d01.addEventListener("click", (ev) => {

        data.colorClick(ev);

    });

    return el.content;
}




