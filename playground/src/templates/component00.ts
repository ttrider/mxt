import * as mxt from "./mxt-runtime-2";
import { if01 } from "./if01";

export function component00(data: any, host?: null | undefined | Element | mxt.InsertPointProvider) {
    return mxt.createComponent(data, host, c00);

    function c00(dc: mxt.DataContext, ipp: mxt.InsertPointProvider): mxt.Component {

        return mxt.Context.create({
            dc: dc,
            ipp: ipp,
            parts: [
                if01,
                {
                    part: if01,
                    dc: () => {
                        const { inner } = dc.$data;
                        return mxt.createDataContext(inner, { parent: dc })
                    }
                },
                {
                    part: if01,
                    dc: () => {
                        const { inner2 } = dc.$data;
                        return mxt.createDataContext(inner2, { parent: dc })
                    }
                }
            ]

        });
    }
}
