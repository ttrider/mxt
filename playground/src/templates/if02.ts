import $r$ from "../mxt-rt";

const { if02 } =
    $r$({
        exports: { "if02": "p00" },
        parts: {
            "p00": ($pf$) => {
                return {
                    sequence: [
                        $pf$.p01,
                        { part: $pf$.p02, when: ($on: any, $dc$) => $on },
                        $pf$.p04
                    ],
                    switch: ($dc$) => {
                        const { showElement } = $dc$.$data;
                        return showElement;
                    }
                }
            },
            "p01": ($pf$) => {
                return {
                    template: `<hr/><div id="tagid_1">Before IF</div>`,
                    attachTo: [
                        {
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
                                        const { toggleClick } = $dc$.$data;
                                        toggleClick.bind($dc$.$data)(ev, $dc$.$data, $dc$);
                                    },
                                    flags: 0x0001 | 0x0002 | 0x0004 | 0x0020
                                }
                            ]
                        }
                    ]
                }
            },
            "p02": ($pf$) => {
                return {
                    sequence: [
                        $pf$.p03,
                        { part: $pf$.p05, when: ($on: any, $dc$) => $on }
                    ],
                    switch: ($dc$) => {
                        const { showSubElement } = $dc$.$data;
                        return showSubElement;
                    }
                }
            },
            "p03": ($pf$) => {
                return {
                    template: `<hr/><div id="tagid_2">Yes, it is TRUE</div>`,
                    attachTo: [{
                        id: "tagid_2",
                        attrs: ($dc$) => {
                            const { color } = $dc$.$data;
                            return { "style": `color: ${color}` }
                        },
                        events: [
                            {
                                name: "click", flags: 0x0001 | 0x0002 | 0x0004 | 0x0020,
                                handler: (ev, $dc$) => {
                                    const { colorClick } = $dc$.$data;
                                    colorClick.bind($dc$.$data)(ev, $dc$.$data, $dc$);
                                }
                            }
                        ]
                    }]
                }
            },
            "p04": ($pf$) => {
                return {
                    template: `<hr/><div id="tagid_3">After IF</div>`,
                    attachTo: [
                        {
                            id: "tagid_3",

                            attrs: ($dc$) => {
                                const { color } = $dc$.$data;
                                return { "style": `color: ${color}` }
                            },
                            events: [
                                {
                                    name: "click", flags: 0x0001 | 0x0002 | 0x0004 | 0x0020,
                                    handler: (ev, $dc$) => {
                                        const { colorClick } = $dc$.$data;
                                        colorClick.bind($dc$.$data)(ev, $dc$.$data, $dc$);
                                    }

                                }
                            ]
                        }
                    ]
                }
            },
            "p05": ($pf$) => {
                return {
                    template: "<div id=\"tagid_4\">Yes, it is TRUE and TRUE</div>",
                    attachTo: [
                        {
                            id: "tagid_4",

                            attrs: ($dc$) => {
                                const { color } = $dc$.$data;
                                return { "style": `color: ${color}` }
                            },
                            events: [
                                {
                                    name: "click", flags: 0x0001 | 0x0002 | 0x0004 | 0x0020,
                                    handler: (ev, $dc$) => {
                                        const { colorClick } = $dc$.$data;
                                        colorClick.bind($dc$.$data)(ev, $dc$.$data, $dc$);
                                    }

                                }
                            ]
                        }
                    ]
                }
            }
        }
    }
    );
export { if02 };
export default if02;