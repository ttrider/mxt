import * as mxt from "./mxt-runtime";

const $$mxt$$ = mxt.createTemplateSet(
    `<div>Array Loop:</div>`,

    `<table id="tagid_1" style="border: 1px solid blue">
    </table>`,

    `<hr/>
    <div>Property Loop:</div>`,

    `<table id="tagid_2" style="border: 1px solid rgb(0, 251, 255)">
    </table>`,

    `<tr>
    <td id="tagid_3">\${name}</td>
    <td id="tagid_4">\${subTitle}</td>
    </tr>
    <tr>
        <td id="tagid_5" colspan="2">\${link}</td>
    </tr>`,

    `<tr id="tagid_6" style="background: \${$index%2?\`#f0f0f0\`:\`#fefefe\`}">
    <td id="tagid_7">\${$key}</td>
    <td id="tagid_8">\${value}</td>
    </tr>
    <tr>
        <td id="tagid_9" colspan="2">\${description}</td>
    </tr>`
);

export function loop01(data: any, host?: null | undefined | Element) {

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
                (point: mxt.InsertPointProvider) => { return { component: s01(dataContext, point) } },
                (point: mxt.InsertPointProvider) => { return { component: s02(dataContext, point) } },
                (point: mxt.InsertPointProvider) => { return { component: s03(dataContext, point) } },
            ]
        );
    }

    function c01(dataContext: mxt.DataContext, segmentInsertPoint: mxt.InsertPointProvider): mxt.Component {

        return mxt.createLoop(
            dataContext,
            segmentInsertPoint,
            () => {
                const { items } = dataContext.$data;
                return items;
            },
            (point: mxt.InsertPointProvider) => { return { component: s04(dataContext, point) } }
        );
    }
    function c02(dataContext: mxt.DataContext, segmentInsertPoint: mxt.InsertPointProvider): mxt.Component {

        return mxt.createLoop(
            dataContext,
            segmentInsertPoint,
            () => {
                const { items } = dataContext.$data;
                return items;
            },
            (point: mxt.InsertPointProvider) => { return { component: s05(dataContext, point) } }
        );
    }

    function s00(dataContext: mxt.DataContext, segmentInsertPoint: mxt.InsertPointProvider): mxt.Component {

        return (mxt.createSegment($$mxt$$[0], {
            segmentInsertPoint,
            elements: {
            }
        }));
    }
    function s01(dataContext: mxt.DataContext, segmentInsertPoint: mxt.InsertPointProvider): mxt.Component {

        return (mxt.createSegment($$mxt$$[1], {
            segmentInsertPoint,
            elements: {
                "tagid_1": {
                    id: "tagid_1",
                    originalId: "",
                    components: [
                        (point: mxt.InsertPointProvider) => { return { component: c01(dataContext, point) } },
                    ]
                }
            }
        }));
    }
    function s02(dataContext: mxt.DataContext, segmentInsertPoint: mxt.InsertPointProvider): mxt.Component {

        return (mxt.createSegment($$mxt$$[2], {
            segmentInsertPoint,
            elements: {
            }
        }));
    }
    function s03(dataContext: mxt.DataContext, segmentInsertPoint: mxt.InsertPointProvider): mxt.Component {

        return (mxt.createSegment($$mxt$$[3], {
            segmentInsertPoint,
            elements: {
                "tagid_2": {
                    id: "tagid_2",
                    originalId: "",
                    components: [
                        (point: mxt.InsertPointProvider) => { return { component: c02(dataContext, point) } },
                    ]
                }
            }
        }));
    }
    function s04(dataContext: mxt.DataContext, segmentInsertPoint: mxt.InsertPointProvider): mxt.Component {

        return (mxt.createSegment($$mxt$$[4], {
            segmentInsertPoint,
            elements: {
                tagid_3: {
                    id: "tagid_3",
                    originalId: "",
                    attributeSetter: (element: Element) => {
                    },
                    textSetter: (element: Element) => {
                        const { name } = dataContext.$data;
                        element.nodeValue = name;
                    },
                },
                tagid_4: {
                    id: "tagid_4",
                    originalId: "",
                    attributeSetter: (element: Element) => {
                    },
                    textSetter: (element: Element) => {
                        const { subTitle } = dataContext.$data;
                        element.nodeValue = subTitle;
                    },
                },
                tagid_5: {
                    id: "tagid_5",
                    originalId: "",
                    attributeSetter: (element: Element) => {
                    },
                    textSetter: (element: Element) => {
                        const { link } = dataContext.$data;
                        element.nodeValue = link;
                    },
                }

            }
        }));
    }

    function s05(dataContext: mxt.DataContext, segmentInsertPoint: mxt.InsertPointProvider): mxt.Component {

        return (mxt.createSegment($$mxt$$[5], {
            segmentInsertPoint,
            elements: {
                tagid_6: {
                    id: "tagid_6",
                    originalId: "",
                    attributeSetter: (element: Element) => {
                        const $index = dataContext.$index ?? 0;
                        element.setAttribute("style", `background: ${$index % 2 ? `#f0f0f0` : `#fefefe`}`);
                    }
                },
                tagid_7: {
                    id: "tagid_7",
                    originalId: "",
                    attributeSetter: (element: Element) => {
                    },
                    textSetter: (element: Element) => {
                        const $key = dataContext.$key;
                        element.nodeValue = $key;
                    },
                },
                tagid_8: {
                    id: "tagid_8",
                    originalId: "",
                    attributeSetter: (element: Element) => {
                    },
                    textSetter: (element: Element) => {
                        const { value } = dataContext.$data;
                        element.nodeValue = value;
                    },
                },
                tagid_9: {
                    id: "tagid_9",
                    originalId: "",
                    attributeSetter: (element: Element) => {
                    },
                    textSetter: (element: Element) => {
                        const { description } = dataContext.$data;
                        element.nodeValue = description;
                    },
                },
            }
        }));
    }

}
