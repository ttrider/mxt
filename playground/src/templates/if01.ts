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

    let disposed = false;

    const segment00 = s00(data, () => { return { element: host, position: "beforeend" } }); //static
    const segment01 = s01(data, segment00.insertPoint); //conditional
    const segment02 = s02(data, segment01.insertPoint); //static

    if (host) {
        insert();
    }
    return {
        get disposed() {
            return disposed;
        },
        appendTo: (element: Element) => {
            host = element;
            insert();
        },
        remove: () => {
            segment00.remove();
            segment01.remove();
            segment02.remove();
        },
        dispose: () => {
            disposed = true;

            segment00.dispose();
            segment01.dispose();
            segment02.dispose();
        }
    };

    function insert() {

        const { showElement } = data;
        segment00.insert();
        if (showElement) {
            segment01.insert();
        } else {
            segment01.remove();
        }
        segment02.insert();

        autorun(() => {
            const { showElement } = data;
            if (showElement) {
                segment01.insert();
            } else {
                segment01.remove();
            }
        });

    }

    function s00(data: any, segmentInsertPoint: mxt.SegmentInsertPointProvider) {

        const $$mxt$$: mxt.SegmentContext = mxt.initializeSegmentContext(ex03r00$$template, {

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
                            },
                            options: { capture: true }
                        }
                    ]
                }
            }
        });

        return {
            insertPoint: () => {
                return mxt.getInsertPoint($$mxt$$);
            },
            insert: () => mxt.insertSegment($$mxt$$),
            remove: () => mxt.removeSegment($$mxt$$),
            dispose: () => mxt.disposeSegment($$mxt$$)
        };
    }
    function s01(data: any, segmentInsertPoint: mxt.SegmentInsertPointProvider) {

        const $$mxt$$: mxt.SegmentContext = mxt.initializeSegmentContext(ex03r01$$template, {

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
                            },
                            options: { capture: true }
                        }
                    ]
                }
            }
        });

        return {
            insertPoint: () => {
                return mxt.getInsertPoint($$mxt$$);
            },
            insert: () => mxt.insertSegment($$mxt$$),
            remove: () => mxt.removeSegment($$mxt$$),
            dispose: () => mxt.disposeSegment($$mxt$$)
        };
    }
    function s02(data: any, segmentInsertPoint: mxt.SegmentInsertPointProvider) {

        const $$mxt$$: mxt.SegmentContext = mxt.initializeSegmentContext(ex03r02$$template, {

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
                            },
                            options: { capture: true }
                        }
                    ]
                }
            }
        });

        return {
            insertPoint: () => {
                return mxt.getInsertPoint($$mxt$$);
            },
            insert: () => mxt.insertSegment($$mxt$$),
            remove: () => mxt.removeSegment($$mxt$$),
            dispose: () => mxt.disposeSegment($$mxt$$)
        };
    }
}
