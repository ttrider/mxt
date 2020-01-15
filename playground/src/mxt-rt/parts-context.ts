import * as rt from "./types";
import { IReactionDisposer, autorun } from "mobx";
import Context from "./context";
import DataContext from "./data-context";



export class PartsContext extends Context {

    private switch?: (dc: DataContext) => any;
    private disposer?: IReactionDisposer;
    private parts: rt.Part[] = [];
    private caseParts?: rt.ConditionalPart[];
    private defParts?: rt.Part[];


    constructor(params: rt.PartsParams, dc: DataContext, ipp: rt.InsertPointProvider) {
        super(params, dc, ipp);

        if (params.switch) {
            this.switch = params.switch;
        }

        let currentPoint = ipp;

        const defParts: rt.Part[] = [];
        const caseParts: rt.ConditionalPart[] = [];

        for (const item of params.sequence) {

            if (typeof item === "function") {
                const partInst = item(dc, currentPoint);
                currentPoint = partInst.getTail;
                this.parts.push(partInst);
            } else {

                const dataContext = item.dc === undefined
                    ? dc
                    : (typeof item.dc === "function")
                        ? item.dc(dc) :
                        item.dc;

                const partInst = item.part(dataContext, currentPoint);
                currentPoint = partInst.getTail;

                if (item.when === undefined) {
                    this.parts.push(partInst);
                } else if (item.when === "default") {
                    defParts.push(partInst);
                } else {
                    caseParts.push({
                        part: partInst,
                        when: item.when,
                        order: item.order ?? 0
                    })
                }
            }
        }

        // sort conditions
        if (caseParts.length > 0) {
            this.caseParts = caseParts.sort(i => i.order);
            this.defParts = defParts;
        } else {
            this.parts.push(...defParts);
        }
        this.tail = currentPoint;
    }

    insert() {
        if (!super.insert()) return;

        this.parts.forEach(i => i.insert());

        if (this.caseParts !== undefined && this.caseParts.length > 0) {

            this.disposer = autorun(() => {

                if (this.caseParts !== undefined) {

                    const $on = (this.switch === undefined) ? undefined : this.switch(this.dc);
                    let def = true;
                    for (const p of this.caseParts) {
                        if (p.when($on, this.dc)) {
                            def = false;
                            p.part.insert();
                        } else {
                            p.part.remove();
                        }
                    }

                    if (def) {
                        this.defParts?.forEach(p => p.insert())
                    }
                    else {
                        this.defParts?.forEach(p => p.remove())
                    }
                }
            });
        }
        return true;
    }

    remove() {

        if (this.disposer) {
            this.disposer();
        }

        this.parts.forEach(p => p.remove());
        this.defParts?.forEach(p => p.remove());
        this.caseParts?.forEach(p => p.part.remove());

        super.remove();
    }

    dispose() {
        this.remove();
        this.dispose();
    }
}

export default PartsContext;