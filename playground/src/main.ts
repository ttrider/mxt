import { observable, computed } from "mobx"

import {init as ex01_init} from "./templates/ex01";
import {init as ex02_init} from "./templates/ex02";
import {init as ex03_init} from "./templates/ex03";

class TestData {
    @observable r = 128;
    @observable g = 18;
    @observable b = 228;

    @computed get color() {
        return "#" + this.r.toString(16) + this.g.toString(16) + this.b.toString(16);
    }

    colorClick() {

        this.r += 10;
        this.g += 15;
        this.b += 35;

        this.r = this.r % 255;
        this.g = this.g % 255;
        this.b = this.b % 255;
    }
}


const data = new TestData();

if (document) {

    // example 01
    const root_ex01 = document.getElementById("ex01");
    if (root_ex01){
        root_ex01.appendChild(ex01_init(data));
    }

    // example 02
    const root_ex02 = document.getElementById("ex02");
    if (root_ex02){
        root_ex02.appendChild(ex02_init(data));
    }

    // example 03
    const root_ex03 = document.getElementById("ex03");
    if (root_ex03){
        root_ex03.appendChild(ex03_init(data));
    }
}

