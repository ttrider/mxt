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

    if (typeof host === "function") {
        return c00(data, host);
    }

    const component = c00(mxt.createDataContext(data), () => { return { element: host, position: "beforeend" } });

    if (host) {
        component.insert();
    }

    return component;


    function c00(dataContext: mxt.DataContext, segmentInsertPoint: mxt.InsertPointProvider): mxt.Component {

        return mxt.Context.create({
            insertPointProvider: segmentInsertPoint,
            components: [
                (point) => { return { component: s00(dataContext, point) } },
                (point) => {
                    return {
                        component: s01(dataContext, point),
                        condition: ($on: any) => $on
                    }
                },
                (point) => { return { component: s02(dataContext, point) } }
            ],
            switchCondition: () => {
                const { showElement } = dataContext.$data;
                return showElement;
            }
        });
    }

    function s00(dataContext: mxt.DataContext, segmentInsertPoint: mxt.InsertPointProvider): mxt.Component {

        return mxt.Context.create({
            template: $$mxt$$[0],
            insertPointProvider: segmentInsertPoint,

            attachTo: [
                {
                    id: "tagid_1",
                    originalId: "",
                    attributeSetter: (element: Element) => {
                        const { color } = dataContext.$data;
                        element.setAttribute("style", `color: ${color}`);
                    },
                    events: [
                        {
                            name: "click",
                            handler: function (ev: Event) {
                                const { toggleClick } = dataContext.$data;
                                toggleClick.bind(dataContext.$data)(ev);
                                ev.preventDefault();
                                ev.stopPropagation();
                                ev.stopImmediatePropagation();
                            },
                            options: { capture: true }
                        }
                    ]
                }
            ]
        });
    }
    function s01(dataContext: mxt.DataContext, segmentInsertPoint: mxt.InsertPointProvider): mxt.Component {

        return mxt.Context.create({
            template: $$mxt$$[1],
            insertPointProvider: segmentInsertPoint,

            attachTo: [{
                id: "tagid_2",
                originalId: "",
                attributeSetter: (element: Element) => {
                    const { color } = dataContext.$data;
                    element.setAttribute("style", `color: ${color}`);
                },
                events: [
                    {
                        name: "click",
                        handler: function (ev: Event) {
                            const { colorClick } = dataContext.$data;
                            colorClick.bind(dataContext.$data)(ev);
                            ev.preventDefault();
                            ev.stopPropagation();
                            ev.stopImmediatePropagation();
                        },
                        options: { capture: true }
                    }
                ]
            }]
        });
    }

    function s02(dataContext: mxt.DataContext, segmentInsertPoint: mxt.InsertPointProvider): mxt.Component {

        return mxt.Context.create({
            template: $$mxt$$[2],
            insertPointProvider: segmentInsertPoint,

            attachTo: [
                {
                    id: "tagid_3",
                    originalId: "",
                    attributeSetter: (element: Element) => {
                        const { color } = dataContext.$data;
                        element.setAttribute("style", `color: ${color}`);
                    },
                    events: [
                        {
                            name: "click",
                            handler: function (ev: Event) {
                                const { colorClick } = dataContext.$data;
                                colorClick.bind(dataContext.$data)(ev);
                                ev.preventDefault();
                                ev.stopPropagation();
                                ev.stopImmediatePropagation();
                            },
                            options: { capture: true }
                        }
                    ]
                }
            ]
        });
    }
}