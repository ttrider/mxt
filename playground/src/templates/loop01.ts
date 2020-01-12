import * as mxt from "./mxt-runtime";

const { loop01 } =
    mxt.register({
        exports: { "loop01": "p00" },
        parts: {
            "p00": ($pf$) => { // 0
                return {
                    sequence: [
                        $pf$.p01, $pf$.p02, $pf$.p03, $pf$.p04
                    ]
                }
            },
            "p01": ($pf$) => { // 1
                return {
                    template: `<div>Array Loop:</div>`
                }
            },
            "p02": ($pf$) => { // 2
                return {
                    template: `<table id="tagid_1" style="border: 1px solid blue"></table>`,
                    embed: {
                        "tagid_1": $pf$.p07
                    }
                }
            },
            "p03": ($pf$) => { // 3
                return {
                    template: `<hr/><div>Property Loop:</div>`
                }
            },
            "p04": ($pf$) => { // 4
                return {
                    template: `<table id="tagid_2" style="border: 1px solid rgb(0, 251, 255)"></table>`,
                    embed: {
                        "tagid_2": $pf$.p08
                    }
                }
            },
            "p05": ($pf$) => { // 5
                return {
                    template: `<tr>
                    <td id="tagid_3">\${name}</td>
                    <td id="tagid_4">\${subTitle}</td>
                    </tr>
                    <tr>
                        <td id="tagid_5" colspan="2">\${link}</td>
                    </tr>`,
                    attachTo: [
                        {
                            id: "tagid_3",
                            value: ($dc$) => {
                                const { title } = $dc$.$data;
                                return title;
                            }
                        },
                        {
                            id: "tagid_4",
                            value: ($dc$) => {
                                const { subTitle } = $dc$.$data;
                                return subTitle;
                            }
                        },
                        {
                            id: "tagid_5",
                            value: ($dc$) => {
                                // const { link } = $dc$.$data;
                                // return link;
                                return $dc$.$index;
                            }
                        }
                    ]
                }
            },
            "p06": ($pf$) => { // 6
                return {
                    template: `<tr id="tagid_6" style="background: \${$index%2?\`#f0f0f0\`:\`#fefefe\`}">
                    <td id="tagid_7">\${$key}</td>
                    <td id="tagid_8">\${value}</td>
                    </tr>
                    <tr>
                        <td id="tagid_9" colspan="2">\${description}</td>
                    </tr>`,
                    attachTo: [
                        {
                            id: "tagid_6",
                            attrs: ($dc$) => {
                                const $index = $dc$.$index ?? 0;
                                return {
                                    "style": `background: ${$index % 2 ? `#f0f0f0` : `#fefefe`}`
                                };
                            }
                        },
                        {
                            id: "tagid_7",
                            value: ($dc$) => {
                                const $key = $dc$.$key;
                                return $key;
                            }
                        },
                        {
                            id: "tagid_8",
                            value: ($dc$) => {
                                const { value } = $dc$.$data;
                                return value;
                            }
                        },
                        {
                            id: "tagid_9",
                            value: ($dc$) => {
                                const { description } = $dc$.$data;
                                return description;
                            }
                        },
                    ]
                }
            },
            "p07": ($pf$) => { // 7
                return {
                    forEach: ($dc$) => {
                        const { items } = $dc$.$data;
                        return items;
                    },
                    part: $pf$.p05
                }
            },
            "p08": ($pf$) => { // 8
                return {
                    forEach: ($dc$) => {
                        const { properties } = $dc$.$data;
                        return properties;
                    },
                    part: $pf$.p06
                }
            },
        }
    }
    );

export { loop01 };
export default loop01;

