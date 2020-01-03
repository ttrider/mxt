import { autorun } from "mobx";
import * as mxt from "./mxt-runtime";

const $$mxt$$ = mxt.createTemplateSet(
    `<div id="tagid_1">Click to switch</div>`,
    `<div id="tagid_2">Switch index 0</div>`,
    `<div id="tagid_3">Switch index 1</div>`,
    `<div id="tagid_4">Switch index 2</div>`,
    `<div id="tagid_5">Switch index default</div>`,
);


export function switch01(data: any, host?: null | undefined | Element) {

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
                (point: mxt.InsertPointProvider, parent) => c01(dataContext, point, parent),
            ],
            (segments) => {
                segments[0].insert();
                segments[1].insert();
            },
            (segments) => {
            },
        );

    }

    function c01(dataContext: mxt.DataContext, segmentInsertPoint: mxt.InsertPointProvider, parentContext?: mxt.ContainerContext): mxt.Component {

        return mxt.createContainer(
            parentContext,
            segmentInsertPoint,
            [
                (point: mxt.InsertPointProvider) => s01(dataContext, point),
                (point: mxt.InsertPointProvider) => s02(dataContext, point),
                (point: mxt.InsertPointProvider) => s03(dataContext, point),
                (point: mxt.InsertPointProvider) => s04(dataContext, point)
            ],
            (segments) => {

            },
            (segments) => {
                const { switchindex } = dataContext.$data;
                // if switchindex is an expression
                // create a new variable
                const $on = switchindex;
                if ($on == 0) {
                    segments[1].remove();
                    segments[2].remove();
                    segments[3].remove();
                    segments[0].insert();
                }
                else if ($on == "1") {
                    segments[0].remove();
                    segments[2].remove();
                    segments[3].remove();
                    segments[1].insert();
                }
                else if ($on == 2) {
                    segments[1].remove();
                    segments[0].remove();
                    segments[3].remove();
                    segments[2].insert();
                }
                else {
                    segments[1].remove();
                    segments[2].remove();
                    segments[0].remove();
                    segments[3].insert();
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
