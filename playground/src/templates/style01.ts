import $r$ from "../mxt-rt";

const { style01 } =
    $r$({
        components: {
            "style01": {
                part: "p00",
                css: ($cid) => `.${$cid} .component {color: brown;} .${$cid} .component:hover {color: yellow;}`,
                dyncss: [($dc$) => {
                    const { color } = $dc$.$data;
                    const $iid = $dc$.$iid;
                    return `.${$iid} div {background: #f0f0f0;cursor: pointer;color: ${color};} .${$iid} div:hover {background: #e0e0f0;}`;
                }]
            }
        },
        parts: {

            "wrap": ($pf$) => {
                return {
                    template: `<span id="tagid_3"></span>`,
                    attachTo:
                        [
                            {
                                id: "tagid_3",
                                attrs: ($dc$) => {
                                    return {
                                        "class": `${$dc$.$iid}`
                                    }
                                },
                                embed: $pf$.p00
                            }
                        ],
                }
            },

            "p00": ($pf$) => {
                return {
                    template: "<div class=\"component global\">Hello Styled Component!</div>",
                }
            }
        },
        globals: {
            styles: [".global {font-size: 1.1em;}"]
        }
    });
export { style01 };
export default style01;
