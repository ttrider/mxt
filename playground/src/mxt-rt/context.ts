import { DataContext } from "./data-context";
import * as rt from ".";
import { CommonParams } from ".";

export class Context {
    dc: DataContext;
    disposed: boolean;
    attached: boolean;
    head: rt.InsertPointProvider;
    tail: rt.InsertPointProvider;
    styles?: Array<(dc: DataContext) => string>;
    cid?: string;

    getTail: () => rt.ComponentInsertPosition = () => {
        if (this.attached) {
            if (this.tail) {
                return this.tail();
            }
        }
        return this.head();
    }

    constructor(params: CommonParams, dc: DataContext, ipp: rt.InsertPointProvider) {
        this.styles = params.styles;
        this.cid = params.cid;
        this.dc = dc;
        this.head = ipp;
        this.tail = ipp;
        this.disposed = false;
        this.attached = false;

        // if we have cid or styles, then we need to wrap it in a span
    }

    updateHead(ipp?: Element | rt.ComponentInsertPosition | rt.InsertPointProvider | undefined | null) {

        if (!ipp) {
            return;
        }
        if (typeof ipp === "function") {
            this.head = ipp;
        } else if (isInsertPoint(ipp)) {
            this.head = () => ipp;
        } else {
            this.head = () => { return { element: ipp, position: "beforeend" } as rt.ComponentInsertPosition }
        }

        function isInsertPoint(item: rt.ComponentInsertPosition | Element): item is rt.ComponentInsertPosition {
            return ((item as any).nodeName === undefined);
        }
    }

    dispose() {
        this.remove();
        this.disposed = true;
    }

    remove() {
        this.attached = false;
    }

    insert() {
        if (this.disposed) return;
        this.attached = true;
        return true;
    }

}

export default Context;
