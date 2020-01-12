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
                    embed: {
                        "tagid_1": $pf$.p01
                    }
                }
            },
            "p01": ($pf$) => {
                return {
                    sequence: [
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
            "p02": "<span>before</span>",
            "p03": "<span>text</span>",
            "p04": "<span>after</span>"
        }
    }
    );
export { if03 };

export default if03;