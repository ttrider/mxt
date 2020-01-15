import $r$ from "../mxt-rt";

const { if03 } =
    $r$({
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
                    attachTo: [
                        {
                            id: "tagid_1",
                            embed: $pf$.p01
                        }
                    ]
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