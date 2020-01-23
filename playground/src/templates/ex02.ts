import $r$ from "../mxt-rt";
const { ex02 } = $r$({
    components: { ex02: "p2" },
    parts: { p2: $pf$ => {
            return {
                template: "\n    <div id=\"tagid_2\">Hello MXT!</div>\n",
                attachTo: [{
                        id: "tagid_2",
                        attrs: $dc$ => {
                            const { color } = $dc$.$data;
                            return { style: `color: ${color}` };
                        }
                    }]
            };
        } }
});
export { ex02 };
export default ex02;
