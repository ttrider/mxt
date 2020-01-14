import * as mxt from "./mxt-runtime";

const { style01 } =
    mxt.register({
        exports: {
            "style01": {
                part: "p00",
                styles: ($cid) => [
                    `.${$cid} .component {color: brown;} .${$cid} .component:hover {color: yellow;}`
                ]
            }
        },
        parts: {
            "p00": ($pf$) => {
                return {
                    template: "<div>Hello Styled Component!</div>",
                    styles: [($dc$) => {
                        const { color } = $dc$.$data;
                        const $iid = $dc$.$iid;
                        return `.${$iid} div {background: #f0f0f0;cursor: pointer;color: ${color};} .${$iid} div:hover {background: #e0e0f0;}`;
                    }]
                }
            }
        },
        globals: {
            styles: [".global {font-size: 1.1em;}"]
        }
    });
export { style01 };
export default style01;
