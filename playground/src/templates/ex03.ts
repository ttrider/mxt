import { autorun } from "mobx";

const template = `<div id="t01id01">Hello MXT!</div>`;

// initialize 
const te = document.createElement("template");
te.innerHTML = template;

const ts001 = document.createElement("style");
ts001.innerHTML = `.ts001 div {background: greenyellow;cursor: pointer;box-sizing: content-box;}
    .ts001 div:hover{border: dashed salmon 1px;}`;
document.head.appendChild(ts001);

export function init(data: any) {

    const el = document.importNode(te, true);

    const d01 = el.content.getElementById("t01id01");
    if (!d01) throw new Error("missing element");
    d01.removeAttribute("id");
    

    // set or update style
    autorun(() => {
        d01.setAttribute("style", `color: ${data.color}`);
    });

    // wiring in the click
    d01.addEventListener("click", (ev) => {

        data.colorClick();


    });

    const wrapper = document.createElement("style-context");
    wrapper.setAttribute("class", "ts001");
    wrapper.appendChild(el.content);

    return wrapper;
}




