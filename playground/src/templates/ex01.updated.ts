import { autorun } from "mobx";
import * as mxt from "./mxt-runtime";
const ex01$$template = document.createElement("template");
ex01$$template.innerHTML = `
    <div id="tagid_1">Hello MXT!</div>
`;

export function ex01(data: any, host?: null | undefined | Element) {

    let disposed = false;
    const segment00 = s00(data, () => { return { element: host, position: "beforeend" } })

    if (host) {
        segment00.insert();
    }

    return {
        get disposed() {
            return disposed;
        },

        appendTo: (element: Element) => {
            host = element;
            segment00.insert();
        },
        remove: () => segment00.remove(),
        dispose: () => {
            disposed = true;
            segment00.dispose();
        }
    };

    function s00(data: any, segmentInsertPoint: mxt.SegmentInsertPointProvider) {

        const $$mxt$$: mxt.SegmentContext = mxt.initializeSegmentContext(ex01$$template, {

            segmentInsertPoint,

            elements: {
                tagid_1: {
                    id: "tagid_1",
                    originalId: "",
                    attributeSetter: (element: Element) => {
                        const { color } = data;
                        element.setAttribute("style", `color: ${color}`);
                    },
                    events: []
                }
            }
        });

        return {
            insertPoint: () => {
                return mxt.getSegmentInsertPoint($$mxt$$);
            },
            insert: () => mxt.insertSegment($$mxt$$),
            remove: () => mxt.removeSegment($$mxt$$),
            dispose: () => mxt.disposeSegment($$mxt$$)
        };
    }
}