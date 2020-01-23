import $r$ from "../mxt-rt";
const { ex01 } = $r$({
    components: { ex01: "p1" },
    parts: { p1: $pf$ => {
            return {
                template: "\n    <div id=\"tagid_1\">Hello MXT!</div>\n",
                attachTo: [{
                        id: "tagid_1",
                        attrs: $dc$ => {
                            const { color } = $dc$.$data;
                            return { style: `color: ${color}` };
                        }
                    }]
            };
        } }
});
export { ex01 };
export default ex01;
