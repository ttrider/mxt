import * as mxt from "./mxt-runtime-3";

const { if01 } =
    mxt.register(
        { "if01": "p00" },
        {
            "p00": ($pf$) => {
                return {
                    parts: [
                        $pf$.p01,
                        { part: $pf$.p02, when: ($on: any, $dc$) => $on },
                        $pf$.p03
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
                                        toggleClick.call($dc$.$data, ev, $dc$.$data, $dc$);
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
                                    colorClick.call($dc$.$data, ev, $dc$.$data, $dc$);
                                }
                            }
                        ]
                    }]
                }
            },
            "p03": ($pf$) => {
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
                                        colorClick.call($dc$.$data, ev, $dc$.$data, $dc$);
                                    }
                                }
                            ]
                        }
                    ]
                }
            }
        }
    );
export { if01 };
export default if01;
