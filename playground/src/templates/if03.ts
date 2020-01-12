import * as mxt from "./mxt-runtime-3";

const { if03 } =
    mxt.register({
        exports: { "if03": "p00" },
        parts: {
            "p00": ($pf$) => {
                return {
                    template: `<table border="1">
                        <tr>
                        <th>something</th>
                        </tr>
                        <tr>
                            <td id="tagid_1">
                            </td>
                        </tr>
                    </table>`,
                    parts: {
                        "tagid_1": $pf$.p01
                    }
                }
            },
            "p01": ($pf$) => {
                return {
                    parts: [
                        $pf$.p02,
                        { part: $pf$.p03, when: ($on: any, $dc$) => $on },
                        $pf$.p04
                    ],
                    switch: ($dc$) => {
                        const { showElement } = $dc$.$data;
                        return showElement;
                    }
                }
            },
            "p02": ($pf$) => {
                return {
                    template: `<span>before</span>`,
                }
            },
            "p03": ($pf$) => {
                return {
                    template: `<span>text</span>`,
                }
            },
            "p04": ($pf$) => {
                return {
                    template: `<span>after</span>`,
                }
            },
        }
    }
    );
export { if03 };

export default if03;