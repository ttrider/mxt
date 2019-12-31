import { autorun } from "mobx";
import * as mxt from "./mxt-runtime";
const ex01$$template = document.createElement("template");
ex01$$template.innerHTML = `
    <div id="tagid_1">Hello MXT!</div>
`;

export function ex01(data: any, host?: null | undefined | Element) {

    const component = s00(data, () => { return { element: host, position: "beforeend" } });

    if (host) {
        component.insert();
    }

    return component;

    function s00(data: any, segmentInsertPoint: mxt.SegmentInsertPointProvider) {

        return mxt.initializeSegmentContext(ex01$$template, {

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
    }
}