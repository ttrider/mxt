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

    const $$mxt$$: mxt.SegmentContainer = mxt.initializeSegmentContainer(

        () => { return { element: host, position: "beforeend" } },
        (point: mxt.SegmentInsertPointProvider) => s00(data, point),
        (point: mxt.SegmentInsertPointProvider) => s01(data, point),
        (point: mxt.SegmentInsertPointProvider) => s02(data, point)
    );

    if (host) {
        insertComponent();
    }
    return {

        insertPoint: () => mxt.getContainerInsertPoint($$mxt$$),
        insert: (host?: mxt.SegmentInsertPoint) => insertComponent(host),
        remove: () => mxt.removeContainer($$mxt$$),
        dispose: () => mxt.disposeContainer($$mxt$$)


    };

    function insertComponent(element?: mxt.SegmentInsertPoint) {

        mxt.updateContainerInsertPoint($$mxt$$, element);

        const [segment00, segment01, segment02] = $$mxt$$.segments;

        segment00.insert();
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

    function s00(data: any, segmentInsertPoint: mxt.SegmentInsertPointProvider): mxt.SegmentComponent {

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
                                ev.preventDefault();
                                ev.stopPropagation();
                                ev.stopImmediatePropagation();
                            },
                            options: { capture: true }
                        }
                    ]
                }
            }
        });

        return {
            insertPoint: () => mxt.getSegmentInsertPoint($$mxt$$),
            insert: (host?: mxt.SegmentInsertPoint) => mxt.insertSegment($$mxt$$, host),
            remove: () => mxt.removeSegment($$mxt$$),
            dispose: () => mxt.disposeSegment($$mxt$$)
        };
    }
    function s01(data: any, segmentInsertPoint: mxt.SegmentInsertPointProvider): mxt.SegmentComponent {

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
                                ev.preventDefault();
                                ev.stopPropagation();
                                ev.stopImmediatePropagation();
                            },
                            options: { capture: true }
                        }
                    ]
                }
            }
        });

        return {
            insertPoint: () => mxt.getSegmentInsertPoint($$mxt$$),
            insert: (host?: mxt.SegmentInsertPoint) => mxt.insertSegment($$mxt$$, host),
            remove: () => mxt.removeSegment($$mxt$$),
            dispose: () => mxt.disposeSegment($$mxt$$)
        };
    }
    function s02(data: any, segmentInsertPoint: mxt.SegmentInsertPointProvider): mxt.SegmentComponent {

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
                                ev.preventDefault();
                                ev.stopPropagation();
                                ev.stopImmediatePropagation();
                            },
                            options: { capture: true }
                        }
                    ]
                }
            }
        });

        return {
            insertPoint: () => {
                return mxt.getSegmentInsertPoint($$mxt$$);
            },
            insert: (host?: mxt.SegmentInsertPoint) => mxt.insertSegment($$mxt$$, host),
            remove: () => mxt.removeSegment($$mxt$$),
            dispose: () => mxt.disposeSegment($$mxt$$)
        };
    }
}
