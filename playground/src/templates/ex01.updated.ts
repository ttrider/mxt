import $r$ from "../mxt-rt";

const { ex01 } =
    $r$({
        components: { "ex01": "p01" },
        parts: {
            "p01": ($pf$) => {
                return {
                    template: `<div id="tagid_1">Hello MXT!</div>`,
                    attachTo: [
                        {
                            id: "tagid_1",
                            attrs: ($dc$) => {
                                const { color } = $dc$.$data;
                                return {
                                    "style": `color: ${color}`
                                }
                            },
                        }
                    ]
                }
            },
        }
    }
    );
export { ex01 };
export default ex01;