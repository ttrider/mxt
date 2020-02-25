import $r$ from "../mxt-rt";

const { if04 } =
    $r$({
        components: { "if04": "p00" },
        parts: {
            "p00": ($pf$) => {
                return {
                    template: `<table border="1">
                        <tr>
                        <th>something</th>
                        </tr>
                        <tr>
                            <td>
                                before<span id="tagid_1"></span>after
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
                        { part: $pf$.p02, when: ($on: any, $dc$) => $on },
                    ],
                    switch: ($dc$) => {
                        const { showElement } = $dc$.$data;
                        return showElement;
                    }
                }
            },
            "p02": "<span>text</span>",
        }
    }
    );
export { if04 };

export default if04;