import * as mxt from "./mxt-runtime-3";
import if01 from "./if01";


const { c01 } =
    mxt.register(
        { "c01": 0 },
        [
            ($pf$) => {
                return {
                    parts: [
                        if01,
                        {
                            part: if01,
                            dc: ($dc$) => {
                                const { inner } = $dc$.$data;
                                return $dc$.create(inner);
                            }
                        },
                        {
                            part: if01,
                            dc: ($dc$) => {
                                const { inner2 } = $dc$.$data;
                                return $dc$.create(inner2);
                            }
                        }
                    ]
                }
            }
        ]
    );
export { c01 };
export default c01;