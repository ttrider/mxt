import $r$, { ComponentFactory } from "../mxt-rt";

//namespace style02ns {

export const { style02 } =
    $r$({
        components: {
            "style02": {
                part: "p00",
                css: ($cid) => `.${$cid} .component {color: lightblue;} .${$cid} .component:hover {color: yellow;}`,
                dyncss: [($dc$) => {
                    const { color } = $dc$.$data;
                    const $iid = $dc$.$iid;
                    return `.${$iid} div {background: #b0b0f0;cursor: pointer;color: ${color};} .${$iid} div:hover {background: #e0e0f0;}`;
                }],
                // events:{

                // }
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
                    template: "<div class=\"component global\">Hello Another Styled Component!</div>",
                }
            }
        },
        globals: {
            styles: [".global {font-size: 1.2em;}"]
        }
    });
//}
//const style02 = style02ns.style02;
//export { style02 };

//namespace style01ns {

export const { style01 } =
    $r$({
        components: {
            "style01": {
                part: "p00",
                css: ($cid) => `.${$cid} .component {color: brown;} .${$cid} .component:hover {color: yellow;}`,
                dyncss: [($dc$) => {
                    const { color } = $dc$.$data;
                    const $iid = $dc$.$iid;
                    return `.${$iid} div {background: #f0f0f0;cursor: pointer;color: ${color};} .${$iid} div:hover {background: #e0e0f0;}`;
                }],
                // events:{

                // }
            }
        },
        parts: {


            "p00": ($pf$) => {
                return {
                    template: "<div class=\"component global\">Hello Styled Component!</div><span id=\"tagid_3\"></span>",
                    attachTo:
                        [
                            {
                                id: "tagid_3",
                                embed: $pf$.st2
                            }
                        ]
                }
            }
        },
        globals: {
            styles: [".global {font-size: 1.1em;}"]
        },
        imports: {
            "st2": style02
        }
    });
//}

//const style01 = style01ns.style01;
//export { style01 };



