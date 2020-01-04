import { autorun } from "mobx";
import * as mxt from "./mxt-runtime";

const $$mxt$$ = mxt.createTemplateSet(
    `<div id="tagid_1">Click to switch</div>`,
    `<div id="tagid_2">Switch index 0</div>`,
    `<div id="tagid_3">Switch index 1</div>`,
    `<div id="tagid_4">Switch index 2</div>`,
    `<div id="tagid_5">Switch index default</div>`,
);


export function switch01(data: any, host?: null | undefined | Element| mxt.InsertPointProvider) {

    if (typeof host === "function") {
        return c00(data, host);
    }
    const component = c00(mxt.createDataContext(data), () => { return { element: host, position: "beforeend" } });

    if (host) {
        component.insert();
    }

    return component;

    function c00(dataContext: mxt.DataContext, segmentInsertPoint: mxt.InsertPointProvider): mxt.Component {

        return mxt.createContainer(
            segmentInsertPoint,
            [
                (point: mxt.InsertPointProvider) => { return { component: s00(dataContext, point) } },
                (point: mxt.InsertPointProvider) => { return { component: c01(dataContext, point) } },
            ]
        );

    }

    function c01(dataContext: mxt.DataContext, segmentInsertPoint: mxt.InsertPointProvider): mxt.Component {

        return mxt.createContainer(
            segmentInsertPoint,
            [
                (point: mxt.InsertPointProvider) => {
                    return {
                        component: s01(dataContext, point),
                        conditionOrder: 0,
                        condition: ($on:any) => $on == 0
                    }
                },
                (point: mxt.InsertPointProvider) => {
                    return {
                        component: s02(dataContext, point),
                        conditionOrder: 1,
                        condition: ($on:any) => $on == 1
                    }
                },
                (point: mxt.InsertPointProvider) => {
                    return {
                        component: s03(dataContext, point),
                        conditionOrder: 2,
                        condition: ($on:any) => $on == "2"
                    }
                },
                (point: mxt.InsertPointProvider) => {
                    return {
                        component: s04(dataContext, point),
                        condition: "default"
                    }
                },
            ],
            () => {
                const { switchindex } = dataContext.$data;
                return switchindex;
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
                                const { switchClick } = dataContext.$data;
                                switchClick.bind(dataContext.$data)(ev);
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
                tagid_2: {
                    id: "tagid_2",
                    originalId: "",
                    attributeSetter: (element: Element) => {
                    },
                    events: [
                    ]
                }
            }
        }));
    }
    function s02(dataContext: mxt.DataContext, segmentInsertPoint: mxt.InsertPointProvider): mxt.Component {

        return (mxt.createSegment($$mxt$$[2], {

            segmentInsertPoint,

            elements: {
                tagid_3: {
                    id: "tagid_3",
                    originalId: "",
                    attributeSetter: (element: Element) => {
                    },
                    events: [
                    ]
                }
            }
        }));
    }
    function s03(dataContext: mxt.DataContext, segmentInsertPoint: mxt.InsertPointProvider): mxt.Component {

        return (mxt.createSegment($$mxt$$[3], {

            segmentInsertPoint,

            elements: {
                tagid_4: {
                    id: "tagid_4",
                    originalId: "",
                    attributeSetter: (element: Element) => {
                    },
                    events: [
                    ]
                }
            }
        }));
    }
    function s04(dataContext: mxt.DataContext, segmentInsertPoint: mxt.InsertPointProvider): mxt.Component {

        return (mxt.createSegment($$mxt$$[4], {

            segmentInsertPoint,

            elements: {
                tagid_5: {
                    id: "tagid_5",
                    originalId: "",
                    attributeSetter: (element: Element) => {
                    },
                    events: [
                    ]
                }
            }
        }));
    }


}
