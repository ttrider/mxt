import $r$ from "../mxt-rt";
const { ex03 } = $r$({
    components: { ex03: "p3" },
    parts: { p3: $pf$ => {
            return {
                template: "\n\n    <style>\n        div {\n            background: #f0f0f0;\n            cursor: pointer;\n            box-sizing: content-box;\n        }\n\n        div:hover {\n            background: #e0e0f0;\n        }\n    </style>\n\n    <div id=\"tagid_3\">Hello MXT!</div>\n",
                attachTo: [{
                        id: "tagid_3",
                        attrs: $dc$ => {
                            const { color } = $dc$.$data;
                            return { style: `color: ${color}` };
                        }
                    }]
            };
        } }
});
export { ex03 };
export default ex03;
