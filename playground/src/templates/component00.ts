import * as mxt from "./mxt-runtime-3";
import if01 from "./if01";


const { c01 } =
    mxt.register({
        exports: { "c01": "p00" },
        parts: {
            "p00": ($pf$) => {
                return {
                    parts: [
                        $pf$.if01,
                        {
                            part: $pf$.if01,
                            dc: ($dc$) => {
                                const { inner } = $dc$.$data;
                                return $dc$.create(inner);
                            }
                        },
                        {
                            part: $pf$.if01,
                            dc: ($dc$) => {
                                const { inner2 } = $dc$.$data;
                                return $dc$.create(inner2);
                            }
                        }
                    ]
                }
            }
        }, imports: {
            "if01": if01
        }
    }
    );
export { c01 };
export default c01;