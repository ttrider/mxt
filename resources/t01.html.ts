
const uid = "qwsderf24";
const template = `<template id="t01" type="mxt">
    <div id="t01id01">Hello MXT!</div>
</template>`;

// initialize 
const te = document.createElement("template");
te.innerHTML = template;


function init(data: any) {

    const el = document.importNode(te, true);

    const d01 = el.content.getElementById("t01id01");
    if (!d01) throw new Error("missing element");
    d01.id = "";

    // set or update style
    d01.setAttribute("style", `color: ${data.color}`);

    return el.content;
}


