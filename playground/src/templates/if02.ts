import * as mxt from "./mxt-runtime-3";

const { if02 } =
    mxt.register(
        { "if02": 0 },
        [
            ($pf$) => {
                return {
                    parts: [
                        $pf$[1],
                        { part: $pf$[2], when: ($on: any, $dc$) => $on },
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
            ($pf$) => {
                return {
                    parts: [
                        $pf$[3],
                        { part: $pf$[5], when: ($on: any, $dc$) => $on }
                    ],
                    switch: ($dc$) => {
                        const { showSubElement } = $dc$.$data;
                        return showSubElement;
                    }
                }
            },
            ($pf$) => {
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
            ($pf$) => {
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
            ($pf$) => {
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
        ]
    );
export { if02 };
export default if02;