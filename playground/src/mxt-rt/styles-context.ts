import * as rt from "./types";
import Context from "./context";
import DataContext from "./data-context";
import { Part } from "./parts-context";

export class StylesContext extends Context {

    wrap: Element;
    part: Part;

    constructor(cid: string | undefined, dyncss: Array<(dc: DataContext) => string> | undefined, part: rt.PartFactory, dc: DataContext, ipp: rt.InsertPointProvider) {
        super({ cid }, dc, ipp);


        let currentIpp = ipp;

        this.wrap = document.createElement("span");
        this.wrap.setAttribute("class", (cid ? cid : "") + " " + (dyncss ? dc.$iid : ""));

        currentIpp = () => { return { element: this.wrap, position: "beforeend" } };

        this.part = part(dc, currentIpp);
        this.tail = currentIpp;


    }

    insert() {
        if (!super.insert()) return;

        let { element, position } = this.head();
        if (element) {
            element.insertAdjacentElement(position, this.wrap);
        }
        this.part.insert();
        return true;
    }

    remove() {
        this.part.remove();
        this.wrap.remove();
        super.remove();
    }

    dispose() {
        this.remove();
        delete this.part;
        delete this.wrap;
        super.dispose();
    }
}
export default StylesContext;