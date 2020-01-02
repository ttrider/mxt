import { autorun } from "mobx";
import * as mxt from "./mxt-runtime";

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

export function if01(data: any, host?: null | undefined | Element) {

    const component = c00(data, () => { return { element: host, position: "beforeend" } });

    if (host) {
        component.insert();
    }

    return component;

    function c00(data: any, segmentInsertPoint: mxt.InsertPointProvider, parentContext?: mxt.ContainerContext): mxt.Component {

        return mxt.createContainer(
            parentContext,
            segmentInsertPoint,
            [
                (point: mxt.InsertPointProvider) => s00(data, point),
                (point: mxt.InsertPointProvider) => s01(data, point),
                (point: mxt.InsertPointProvider) => s02(data, point)
            ],
            (segments) => {
                segments[0].insert();
                segments[2].insert();
            },
            (segments) => {
                const { showElement } = data;
                if (showElement) {
                    segments[1].insert();
                } else {
                    segments[1].remove();
                }
            }
        );
    }

    function s00(data: any, segmentInsertPoint: mxt.InsertPointProvider): mxt.Component {

        return (mxt.createSegment(ex03r00$$template, {

            segmentInsertPoint,

            elements: {
                tagid_1: {
                    id: "tagid_1",
                    originalId: "",
                    attributeSetter: (element: Element) => {
                        const { color } = data;
                        element.setAttribute("style", `color: ${color}`);
                    },
                    events: [
                        {
                            name: "click",
                            handler: function (ev: Event) {
                                const { toggleClick } = data;
                                toggleClick.bind(data)(ev);
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
    function s01(data: any, segmentInsertPoint: mxt.InsertPointProvider): mxt.Component {

        return (mxt.createSegment(ex03r01$$template, {

            segmentInsertPoint,

            elements: {
                tagid_1: {
                    id: "tagid_2",
                    originalId: "",
                    attributeSetter: (element: Element) => {
                        const { color } = data;
                        element.setAttribute("style", `color: ${color}`);
                    },
                    events: [
                        {
                            name: "click",
                            handler: function (ev: Event) {
                                const { colorClick } = data;
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
    function s02(data: any, segmentInsertPoint: mxt.InsertPointProvider): mxt.Component {

        return (mxt.createSegment(ex03r02$$template, {

            segmentInsertPoint,

            elements: {
                tagid_1: {
                    id: "tagid_3",
                    originalId: "",
                    attributeSetter: (element: Element) => {
                        const { color } = data;
                        element.setAttribute("style", `color: ${color}`);
                    },
                    events: [
                        {
                            name: "click",
                            handler: function (ev: Event) {
                                const { colorClick } = data;
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
}
