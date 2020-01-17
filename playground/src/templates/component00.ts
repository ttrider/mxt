import $r$ from "../mxt-rt";
import if01 from "./if01";
import if03 from "./if03";


const { c01, c02, c03 } =
    $r$({
        components: { "c01": "p01", "c02": "p02", "c03": "p03" },
        parts: {
            "p01": ($pf$) => {
                return {
                    sequence: [
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
            },
            "p02": ($pf$) => {
                return {
                    sequence: [
                        $pf$.if03,
                        {
                            part: $pf$.if03,
                            dc: ($dc$) => {
                                const { inner } = $dc$.$data;
                                return $dc$.create(inner);
                            }
                        },
                        {
                            part: $pf$.if03,
                            dc: ($dc$) => {
                                const { inner2 } = $dc$.$data;
                                return $dc$.create(inner2);
                            }
                        }
                    ]
                }
            },
            "p03": ($pf$) => {
                return {
                    sequence: [
                        $pf$.c01,
                        $pf$.c02,
                    ]
                }
            }
        }, imports: {
            "if01": if01,
            "if03": if03,
        }
    }
    );
export { c01, c02, c03 };
export default c03;