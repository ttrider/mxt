import $r$ from "../mxt-rt";

const { switch01 } =
    $r$({
        components: { "switch01": "p00" },
        parts: {
            "p00": ($pf$) => {
                return {
                    sequence: [
                        $pf$.s00,
                        { part: $pf$.s01, when: ($on: any, $dc$) => $on == 0 },
                        { part: $pf$.s02, when: ($on: any, $dc$) => $on == 1 },
                        { part: $pf$.s03, when: ($on: any, $dc$) => $on == "2" },
                        { part: $pf$.s05, when: ($on: any, $dc$) => $on > 2 && $on < 4 },
                        { part: $pf$.s04, when: "default" },
                    ],
                    switch: ($dc$) => {
                        const { switchindex } = $dc$.$data;
                        return switchindex;
                    }
                }
            },
            "s00": ($pf$) => {
                return {
                    template: "<div id=\"tagid_1\">Click to switch</div>",
                    attachTo: [{
                        id: "tagid_1",
                        attrs: ($dc$) => {
                            const { color } = $dc$.$data;
                            return {
                                "style": `color: ${color}`
                            }
                        },
                        events: [
                            {
                                name: "click",
                                handler: function (ev: Event, $dc$) {
                                    const { switchClick } = $dc$.$data;
                                    switchClick.bind($dc$.$data)(ev, $dc$.$data, $dc$);
                                },
                                flags: 0x0001 | 0x0002 | 0x0004 | 0x0020
                            }
                        ]

                    }]
                }
            },
            "s01": "<div>Switch index 0</div>",
            "s02": "<div>Switch index 1</div>",
            "s03": "<div>Switch index 2</div>",
            "s04": "<div>Switch index default</div>",
            "s05": "<div>Between 2 and 4</div>"
        }
    }
    );
export { switch01 };
export default switch01;