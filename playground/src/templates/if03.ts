import * as mxt from "./mxt-runtime";

const $$mxt$$ = mxt.createTemplateSet(
    `<table border="1">
    <tr>
    <th>something</th>
    </tr>
    <tr>
        <td id="tagid_1">
        </td>
    </tr>
</table>`,
    `<span>before</span>`,
    `<span>text</span>`,
    `<span>after</span>`
);

export function if03(data: any, host?: null | undefined | Element | mxt.InsertPointProvider) {

    if (typeof host === "function") {
        return s00(data, host);
    }

    const component = s00(mxt.createDataContext(data), () => { return { element: host, position: "beforeend" } });

    if (host) {
        component.insert();
    }

    return component;
}

function s00(dataContext: mxt.DataContext, segmentInsertPoint: mxt.InsertPointProvider): mxt.Component {

    return (mxt.createSegment($$mxt$$[0], {

        segmentInsertPoint,

        elements: {
            "tagid_1": {
                id: "tagid_1",
                originalId: "",
                events: [],
                components:[
                    (point: mxt.InsertPointProvider) => { return { component: c00(dataContext, point) } },
                ]

            }
        }
    }));
}

function c00(dataContext: mxt.DataContext, segmentInsertPoint: mxt.InsertPointProvider): mxt.Component {

    return mxt.createContainer(
        segmentInsertPoint,
        [
            (point: mxt.InsertPointProvider) => { return { component: s01(dataContext, point) } },
            (point: mxt.InsertPointProvider) => {
                return {
                    component: s02(dataContext, point),
                    condition: ($on: any) => $on

                }
            },
            (point: mxt.InsertPointProvider) => { return { component: s03(dataContext, point) } }
        ],
        () => {
            const { showElement } = dataContext.$data;
            return showElement;
        }
    );
}


function s01(dataContext: mxt.DataContext, segmentInsertPoint: mxt.InsertPointProvider): mxt.Component {

    return (mxt.createSegment($$mxt$$[1], {

        segmentInsertPoint,

        elements: {
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
        }
    }));
}

