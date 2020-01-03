import * as mxt from "./mxt-runtime";
import { if01 as test00 } from "./if01";

const ex03r00$$template = document.createElement("template");
ex03r00$$template.innerHTML = `
    <hr/>
    <div id="tagid_1">Before IF</div>   
`;
const ex03r01$$template = document.createElement("template");
ex03r01$$template.innerHTML = `
    <hr/>
    <div id="tagid_2">Yes, it is TRUE</div>
`;
const ex03r02$$template = document.createElement("template");
ex03r02$$template.innerHTML = `
    <hr/>
    <div id="tagid_3">After IF</div>
`;
const ex03r03$$template = document.createElement("template");
ex03r03$$template.innerHTML = `
    <div id="tagid_4">Yes, it is TRUE and TRUE</div>
`;

export function if02(data: any, host?: null | undefined | Element) {

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
                (point: mxt.InsertPointProvider) => { return { component: s00(dataContext, point) } },
                (point: mxt.InsertPointProvider) => {
                    return {
                        component: c01(dataContext, point),
                        condition: ($on: any) => $on
                    }
                },
                (point: mxt.InsertPointProvider) => { return { component: s02(dataContext, point) } },
            ],
            () => {
                const { showElement } = dataContext.$data;
                return showElement;
            }
        );
    }

    function c01(dataContext: mxt.DataContext, segmentInsertPoint: mxt.InsertPointProvider, parentContext?: mxt.ContainerContext): mxt.Component {

        return mxt.createContainer(
            parentContext,
            segmentInsertPoint,
            [
                (point: mxt.InsertPointProvider) => { return { component: s03(dataContext, point) } },
                (point: mxt.InsertPointProvider) => {
                    return {
                        component: s04(dataContext, point),
                        condition: ($on: any) => $on
                    }
                },
            ],
            () => {
                const { showSubElement } = dataContext.$data;
                return showSubElement;
            }
        );
    }

    function s00(dataContext: mxt.DataContext, segmentInsertPoint: mxt.InsertPointProvider): mxt.Component {

        return (mxt.createSegment(ex03r00$$template, {

            segmentInsertPoint,

            elements: {
                tagid_1: {
                    id: "tagid_1",
                    originalId: "",
                    attributeSetter: (element: Element) => {
                        const { inner } = data;
                        element.setAttribute("style", `color: ${inner.color}`);
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
    function s02(dataContext: mxt.DataContext, segmentInsertPoint: mxt.InsertPointProvider): mxt.Component {

        return (mxt.createSegment(ex03r02$$template, {

            segmentInsertPoint,

            elements: {
                tagid_3: {
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
    function s03(dataContext: mxt.DataContext, segmentInsertPoint: mxt.InsertPointProvider): mxt.Component {

        return (mxt.createSegment(ex03r01$$template, {

            segmentInsertPoint,

            elements: {
                tagid_2: {
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
                                colorClick.bind(data)(ev);
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
    function s04(dataContext: mxt.DataContext, segmentInsertPoint: mxt.InsertPointProvider): mxt.Component {

        return (mxt.createSegment(ex03r03$$template, {

            segmentInsertPoint,

            elements: {
                tagid_4: {
                    id: "tagid_4",
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
