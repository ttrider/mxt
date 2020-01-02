import * as mxt from "./mxt-runtime";

const $$mxt$$ = mxt.createTemplateSet(
    `
    <hr/>
    <div id="tagid_1">Before IF</div>   
`,
    `
    <hr/>
    <div id="tagid_2">Yes, it is TRUE</div>
`,
    `
    <hr/>
    <div id="tagid_3">After IF</div>
`
);

export function if01(data: any, host?: null | undefined | Element) {

    const component = c00(mxt.createDataContext(data), () => { return { element: host, position: "beforeend" } });

    if (host) {
        component.insert();
    }

    return component;

    function c00(dataContext: mxt.DataContext, segmentInsertPoint: mxt.InsertPointProvider, parentContext?: mxt.ContainerContext): mxt.Component {

        return mxt.createContainer(
            parentContext,
            segmentInsertPoint,
            [
                (point: mxt.InsertPointProvider) => s00(dataContext, point),
                (point: mxt.InsertPointProvider) => s01(dataContext, point),
                (point: mxt.InsertPointProvider) => s02(dataContext, point)
            ],
            (segments) => {
                segments[0].insert();
                segments[2].insert();
            },
            (segments) => {
                const { showElement } = dataContext.$data;
                if (showElement) {
                    segments[1].insert();
                } else {
                    segments[1].remove();
                }
            }
        );
    }

    function s00(dataContext: mxt.DataContext, segmentInsertPoint: mxt.InsertPointProvider): mxt.Component {

        return (mxt.createSegment($$mxt$$[0], {

            segmentInsertPoint,

            elements: {
                tagid_1: {
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
            }
        }));
    }
    function s01(dataContext: mxt.DataContext, segmentInsertPoint: mxt.InsertPointProvider): mxt.Component {

        return (mxt.createSegment($$mxt$$[1], {

            segmentInsertPoint,

            elements: {
                tagid_1: {
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
                }
            }
        }));
    }
    function s02(dataContext: mxt.DataContext, segmentInsertPoint: mxt.InsertPointProvider): mxt.Component {

        return (mxt.createSegment($$mxt$$[2], {

            segmentInsertPoint,

            elements: {
                tagid_1: {
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
            }
        }));
    }
}
