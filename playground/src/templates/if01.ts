import * as mxt from "./mxt-runtime-2";

const $$mxt$$ = mxt.createTemplateSet(
    `<hr/>
    <div id="tagid_1">Before IF</div>`,
    `<hr/>
    <div id="tagid_2">Yes, it is TRUE</div>`,
    `<hr/>
    <div id="tagid_3">After IF</div>`
);

export function if01(data: any, host?: null | undefined | Element | mxt.InsertPointProvider) {

    return mxt.createComponent(data, host, c00);

    function c00(dc: mxt.DataContext, ipp: mxt.InsertPointProvider): mxt.Component {

        return mxt.Context.create({
            dc,
            ipp,
            parts: [
                s00,
                {
                    part: s01,
                    when: ($on: any) => $on
                },
                s02
            ],
            switch: () => {
                const { showElement } = dc.$data;
                return showElement;
            }
        });
    }

    function s00(dc: mxt.DataContext, ipp: mxt.InsertPointProvider): mxt.Component {

        return mxt.Context.create({
            dc,
            template: $$mxt$$[0],
            ipp,

            attachTo: [
                {
                    id: "tagid_1",
                    attributeSetter: (element) => {
                        const { color } = dc.$data;
                        element.setAttribute("style", `color: ${color}`);
                    },
                    events: [
                        {
                            name: "click",
                            handler: function (ev: Event) {
                                const { toggleClick } = dc.$data;
                                toggleClick.bind(dc.$data)(ev, dc.$data, dc);
                            },
                            flags: 0x0001 | 0x0002 | 0x0004 | 0x0020
                        }
                    ]
                }
            ]
        });
    }
    function s01(dc: mxt.DataContext, ipp: mxt.InsertPointProvider): mxt.Component {

        return mxt.Context.create({
            dc,
            template: $$mxt$$[1],
            ipp,
            attachTo: [{
                id: "tagid_2",

                attributeSetter: (element) => {
                    const { color } = dc.$data;
                    element.setAttribute("style", `color: ${color}`);
                },
                events: [
                    {
                        name: "click",
                        handler: (ev: Event) => {
                            const { colorClick } = dc.$data;
                            colorClick.bind(dc.$data)(ev, dc.$data, dc);
                        },
                        flags: 0x0001 | 0x0002 | 0x0004 | 0x0020
                    }
                ]
            }]
        });
    }

    function s02(dc: mxt.DataContext, ipp: mxt.InsertPointProvider): mxt.Component {

        return mxt.Context.create({
            dc,
            template: $$mxt$$[2],
            ipp,

            attachTo: [
                {
                    id: "tagid_3",
                    attributeSetter: (element: Element) => {
                        const { color } = dc.$data;
                        element.setAttribute("style", `color: ${color}`);
                    },
                    events: [
                        {
                            name: "click",
                            handler: (ev: Event) => {
                                const { colorClick } = dc.$data;
                                colorClick.bind(dc.$data)(ev, dc.$data, dc);
                            },
                            // preventDefault | stopPropagation | stopImmediatePropagation | capture
                            flags: 0x0001 | 0x0002 | 0x0004 | 0x0020
                        }
                    ]
                }
            ]
        });
    }
}