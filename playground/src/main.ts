import { observable, autorun, extendObservable, remove, computed } from "mobx"

import { ex01 } from "./templates/ex01";
import { ex02 } from "./templates/ex02";
import { ex03 } from "./templates/ex03";
import { if01 } from "./templates/if01";
import { if02 } from "./templates/if02";
import if03 from "./templates/if03";
import { switch01 } from "./templates/switch01";
import component00 from "./templates/component00";
import loop01 from "./templates/loop01";
import { style01 } from "./templates/style01";
//import s from "./templates/style01";

// let extandable = observable({

//     p0: 0,
//     p1: 10,
//     p2: 100
// });

// autorun(() => {
//     console.info("=========================");

//     for (const key in extandable) {
//         if (extandable.hasOwnProperty(key)) {
//             const value = extandable[key];

//             console.info(`${key} = ${value}`);
//         }
//     }
//     console.info("=========================");
// });

// console.info("extandable.p0 = 2;");
// extandable.p0 = 2;

// console.info("extandable.p2 = 3;");
// extandable.p2 = 3;

// console.info("extendObservable(extandable, { ex01: 1, ex02: 2 });");
// extendObservable(extandable, { ex01: 1, ex02: 2 });

// console.info("remove(extandable, \"p1\");");
// remove(extandable, "p1");

class Item {
    title: string;
    subTitle: string;
    link?: string;
}

class Property {
    description: string;
    value: number;
}


class InnerData {

    parent: TestData

    @computed get color() {
        return "#" + this.parent.g.toString(16) + this.parent.b.toString(16) + this.parent.r.toString(16);
    }

    @computed get showElement() { return this.parent.showElement; }
    @computed get showSubElement() { return this.parent.showSubElement; }

}

class InnerData2 {

    parent: TestData

    @computed get color() {
        return "#" + this.parent.b.toString(16) + this.parent.r.toString(16) + this.parent.g.toString(16);
    }

    @computed get showElement() { return this.parent.showElement; }
    @computed get showSubElement() { return this.parent.showSubElement; }

}

class TestData {

    @observable switchindex = 0;
    @observable showElement = true;
    @observable showSubElement = true;
    @observable r = 200;
    @observable g = 18;
    @observable b = 228;

    @observable inner: InnerData;
    @observable inner2: InnerData2;

    @computed get color() {
        return "#" + this.r.toString(16) + this.g.toString(16) + this.b.toString(16);
    }

    switchClick() {

        this.switchindex = (this.switchindex + 1) % 5;
    }

    toggleClick() {

        this.showElement = !this.showElement

    }

    colorClick() {

        this.r += 20;
        this.g += 15;
        this.b += 35;

        this.r = this.r % 255;
        this.g = this.g % 255;
        this.b = this.b % 255;

        // if (this.el) {
        //     //this.el.dispose();

        //     const root_mv = document.getElementById("mv");
        //     if (root_mv) {

        //         this.el.appendTo(root_mv);
        //     }
        // }

        this.showSubElement = !this.showSubElement;
    }

    el: any;


    @observable items: Item[] = [
        { title: "Item 1", subTitle: "This is the item 1", link: "http://smile.amazon.com" },
        { title: "Item 2", subTitle: "This is the item 2", link: "http://smile.amazon.com" },
        { title: "Item 3", subTitle: "This is the item 3", link: "http://smile.amazon.com" },
        { title: "Item 4", subTitle: "This is the item 4", link: "http://smile.amazon.com" },
        { title: "Item 5", subTitle: "This is the item 5", link: "http://smile.amazon.com" },
        { title: "Item 6", subTitle: "This is the item 6", link: "http://smile.amazon.com" },
    ];

    properties =
        observable.map({
            "property 1": { description: "This is the property 1", value: 10001 },
            "property 2": { description: "This is the property 2", value: 20002 },
            "property 3": { description: "This is the property 3", value: 30003 },
            "property 4": { description: "This is the property 4", value: 40004 },
            "property 5": { description: "This is the property 5", value: 50005 },
        })
        ;


    constructor() {

        this.inner = new InnerData();
        this.inner.parent = this;

        this.inner2 = new InnerData2();
        this.inner2.parent = this;


    }
}

const data = new TestData();

if (document) {

    const l01 = document.getElementById("loop01");
    loop01(data, l01);

    const styletag01 = document.getElementById("style01");
    style01(data, styletag01);


    //example 01
    const root_ex01 = document.getElementById("ex01");
    if (root_ex01) {
        data.el = ex01(data);
        data.el.insert(root_ex01);
    }

    // // example 02
    const root_ex02 = document.getElementById("ex02");
    if (root_ex02) {
        ex02(data).insert(root_ex02);
    }

    // // example 03
    const root_ex03 = document.getElementById("ex03");
    ex03(data, root_ex03);

    //example 04
    const root_if01 = document.getElementById("if01");
    if01(data, root_if01);

    // example 05
    const root_if02 = document.getElementById("if02");
    if02(data, root_if02);

    const root_if03 = document.getElementById("if03");
    if03(data, root_if03);

    const root_switch01 = document.getElementById("switch01");
    switch01(data, root_switch01);

    const root_component00 = document.getElementById("component00");
    component00(data, root_component00);


    // let pn = 0;

    // setInterval(() => {



    //     data.items.splice(3,0,{ title: `=item= ${pn++} =item=`, subTitle: "This is the item 3", link: "http://smile.amazon.com" });


    // }, 3000);

}

