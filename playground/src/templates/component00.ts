import * as mxt from "./mxt-runtime-2";
import { if01 } from "./if01";

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

        return mxt.Context.create({
            insertPointProvider: segmentInsertPoint,
            components: [
                {
                    componentFactory: if01,
                    dataContext
                },
                {
                    componentFactory: if01,
                    dataContext: () => {
                        const { inner } = dataContext.$data;
                        return mxt.createDataContext(inner, { parent: dataContext })
                    }
                },
                {
                    componentFactory: if01,
                    dataContext: () => {
                        const { inner2 } = dataContext.$data;
                        return mxt.createDataContext(inner2, { parent: dataContext })
                    }
                }
            ]

        });
    }
}
