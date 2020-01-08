import * as mxt from "./mxt-runtime-3";

const { if03 } =
    mxt.register(
        { "if03": 0 },
        [
            ($pf$) => {
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
                        "tagid_1": $pf$[1]
                    }
                }
            },
            ($pf$) => {
                return {
                    parts: [
                        $pf$[2],
                        { part: $pf$[3], when: ($on: any, $dc$) => $on },
                        $pf$[4]
                    ],
                    switch: ($dc$) => {
                        const { showElement } = $dc$.$data;
                        return showElement;
                    }
                }
            },
            ($pf$) => {
                return {
                    template: `<span>before</span>`,
                }
            },
            ($pf$) => {
                return {
                    template: `<span>text</span>`,
                }
            },
            ($pf$) => {
                return {
                    template: `<span>after</span>`,
                }
            },
        ]
    );
export { if03 };

export default if03;