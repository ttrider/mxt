import * as rt from "./types";
import Context from "./context";
import DataContext from "./data-context";
import { Part } from "./parts-context";
import { IReactionDisposer, autorun } from "mobx";

export class StylesContext extends Context {

    wrap: Element;
    part: Part;

    styles: Array<{ element: Element, disposer: IReactionDisposer }>;

    constructor(cid: string | undefined, dyncss: Array<(dc: DataContext) => string> | undefined, part: rt.PartFactory, dc: DataContext, ipp: rt.InsertPointProvider) {
        super({ cid }, dc, ipp);


        let currentIpp = ipp;

        this.wrap = document.createElement("span");
        this.wrap.setAttribute("class", (cid ? cid : "") + " " + (dyncss ? dc.$iid : ""));

        currentIpp = () => { return { element: this.wrap, position: "beforeend" } };

        this.part = part(dc, currentIpp);
        this.tail = currentIpp;

        if (dyncss) {

            this.styles = dyncss.map(item => {

                const element = document.createElement("style");
                document.head.appendChild(element);

                return {
                    element,
                    disposer: autorun(() => {
                        element.innerText = item(dc);
                    })
                };
            })
        }
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

        if (this.styles) {
            for (const item of this.styles) {
                item.disposer();
                item.element.remove();
            }
        }

        super.dispose();
    }
}
export default StylesContext;