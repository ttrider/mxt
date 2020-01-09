import * as mxt from "./mxt-runtime-3";

const { loop01 } =
    mxt.register(
        { "loop01": 0 },
        [
            ($pf$) => { // 0
                return {
                    parts: [
                        $pf$[1], $pf$[2],
                        $pf$[3], $pf$[4]
                    ]
                }
            },
            ($pf$) => { // 1
                return {
                    template: `<div>Array Loop:</div>`
                }
            },
            ($pf$) => { // 2
                return {
                    template: `<table id="tagid_1" style="border: 1px solid blue"></table>`,
                    parts: {
                        "tagid_1": $pf$[7]
                    }
                }
            },
            ($pf$) => { // 3
                return {
                    template: `<hr/><div>Property Loop:</div>`
                }
            },
            ($pf$) => { // 4
                return {
                    template: `<table id="tagid_2" style="border: 1px solid rgb(0, 251, 255)"></table>`,
                    parts: {
                        "tagid_2": $pf$[8]
                    }
                }
            },
            ($pf$) => { // 5
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
                                const { name } = $dc$.$data;
                                return name;
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
                                const { link } = $dc$.$data;
                                return link;
                            }
                        }
                    ]
                }
            },
            ($pf$) => { // 6
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
            ($pf$) => { // 7
                return {
                    forEach: ($dc$) => {
                        const { items } = $dc$.$data;
                        return items;
                    },
                    part: $pf$[5]
                }
            },
            ($pf$) => { // 8
                return {
                    forEach: ($dc$) => {
                        const { properties } = $dc$.$data;
                        return properties;
                    },
                    part: $pf$[6]
                }
            },
        ]
    );

export { loop01 };
export default loop01;

