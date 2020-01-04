import * as mxt from "./mxt-runtime";
import { if01 as c000 } from "./if01";

export function component00(data: any, host?: null | undefined | Element | mxt.InsertPointProvider) {

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
                (point: mxt.InsertPointProvider) => {

                    const { element, position } = point();
                    console.info(`component 1: ${element?.id} at ${position}. parent: ${element?.parentElement?.id}`);
                    return { component: c000(dataContext, point) }
                },
                (point: mxt.InsertPointProvider) => {

                    const { inner } = dataContext.$data;
                    const { element, position } = point();
                    console.info(`component 2: ${element?.id} at ${position}. parent: ${element?.parentElement?.id}`);
                    return { component: c000(mxt.createDataContext(inner, { parent: dataContext }), point) }
                },
                (point: mxt.InsertPointProvider) => {

                    const { inner2 } = dataContext.$data;
                    const { element, position } = point();
                    console.info(`component 3: ${element?.id} at ${position}. parent: ${element?.parentElement?.id}`);
                    return { component: c000(mxt.createDataContext(inner2, { parent: dataContext }), point) }
                },
            ]
        );
    }
}
