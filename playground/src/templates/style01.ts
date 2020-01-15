import * as mxt from "./mxt-runtime";

const { style01 } =
    mxt.register({
        exports: {
            "style01": {
                part: "wrap",
                styles: ($cid) => [
                    `.${$cid} .component {color: brown;} .${$cid} .component:hover {color: yellow;}`
                ]
            }
        },
        parts: {

            "wrap": ($pf$) => {
                return {
                    template: `<span id="tagid_3" class="${$pf$.$cid} ${$pf$.$iid}"></span>`,
                    embed: {
                        "tagid_3": $pf$.p00
                    },
                    styles: [($dc$) => {
                        const { color } = $dc$.$data;
                        const $iid = $dc$.$iid;
                        return `.${$iid} div {background: #f0f0f0;cursor: pointer;color: ${color};} .${$iid} div:hover {background: #e0e0f0;}`;
                    }]
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
