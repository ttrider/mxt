import { observable, autorun, extendObservable, remove, computed } from "mobx"

import { ex01 } from "./templates/ex01";
import { ex02 } from "./templates/ex02";
import { ex03 } from "./templates/ex03";
import { if01 } from "./templates/if01";
import { if02 } from "./templates/if02";
import { switch01 } from "./templates/switch01";
import { switch02 } from "./templates/switch02";

let extandable = observable({

    p0: 0,
    p1: 10,
    p2: 100
});

autorun(() => {
    console.info("=========================");

    for (const key in extandable) {
        if (extandable.hasOwnProperty(key)) {
            const value = extandable[key];

            console.info(`${key} = ${value}`);
        }
    }
    console.info("=========================");
});

console.info("extandable.p0 = 2;");
extandable.p0 = 2;

console.info("extandable.p2 = 3;");
extandable.p2 = 3;

console.info("extendObservable(extandable, { ex01: 1, ex02: 2 });");
extendObservable(extandable, { ex01: 1, ex02: 2 });

console.info("remove(extandable, \"p1\");");
remove(extandable, "p1");


class TestData {

    @observable switchindex = 0;
    @observable showElement = true;
    @observable showSubElement = true;
    @observable r = 200;
    @observable g = 18;
    @observable b = 228;

    @computed get color() {
        return "#" + this.r.toString(16) + this.g.toString(16) + this.b.toString(16);
    }

    switchClick() {

        this.switchindex = (this.switchindex + 1) % 4;
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

    el: any
}

const data = new TestData();

if (document) {

    // example 01
    const root_ex01 = document.getElementById("ex01");
    if (root_ex01) {
        data.el = ex01(data);
        data.el.appendTo(root_ex01);
    }

    // example 02
    const root_ex02 = document.getElementById("ex02");
    if (root_ex02) {
        ex02(data).appendTo(root_ex02);
    }

    // example 03
    const root_ex03 = document.getElementById("ex03");
    ex03(data, root_ex03);

    // example 04
    const root_if01 = document.getElementById("if01");
    if01(data, root_if01);

    // example 05
    const root_if02 = document.getElementById("if02");
    if02(data, root_if02);

    const root_switch01 = document.getElementById("switch01");
    switch01(data, root_switch01);

    const root_switch02 = document.getElementById("switch02");
    switch02(data, root_switch02);
}

