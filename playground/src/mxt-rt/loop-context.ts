import * as rt from "./types";
import { Lambda, isObservableArray, isObservableMap } from "mobx";
import Context from "./context";
import DataContext from "./data-context";

export class LoopContext extends Context {

    forEach: (dc: DataContext) => any;
    part: rt.PartFactory;
    parts: Context[] = [];
    disposer?: Lambda;

    constructor(params: rt.LoopParams, dc: DataContext, ipp: rt.InsertPointProvider) {
        super(params, dc, ipp);

        this.forEach = params.forEach;
        this.part = params.part;

        const loopOver = this.forEach(dc);

        if (isObservableArray(loopOver)) {

            this.disposer = loopOver.observe((change) => {

                if (change.type == "splice") {
                    if (change.removedCount > 0) {
                        this.removeParts(change.index, change.removedCount);
                    }

                    if (change.addedCount > 0) {
                        this.addParts(loopOver, change.index, change.added);
                    }
                } else {


                    const ldc = this.dc.createIteration(change.newValue, loopOver, change.index);
                    const cc = this.part(ldc, this.parts[change.index].head);

                    if (change.index + 1 < this.parts.length) {
                        this.parts[change.index + 1].head = cc.getTail;
                    } else {
                        this.tail = cc.getTail;
                    }

                    this.parts[change.index] = cc;
                    if (this.attached) {
                        cc.insert();
                    }
                }
            }, true);

        } else if (isObservableMap(loopOver)) {

            this.disposer = loopOver.observe((change) => {

                console.info("map change detected");
                console.info(change.object);
                console.info(change.name);
                console.info(change.type);

            });

            // } else if (isObservableValue(loopOver)) {

            //     this.disposer = loopOver.observe((change) => {

            //         console.info("change detected");
            //         console.info(change.object);
            //         console.info(change.oldValue);
            //         console.info(change.newValue);
            //         console.info(change.type);

            //     }, true);
            this.tail = ipp;

        } else if (Array.isArray(loopOver)) {
            // static array

            this.parts.forEach(p => p.dispose());
            this.parts = [];
            this.tail = this.head;

            this.addParts(loopOver, 0, loopOver)
        } else {
            // regular object

            // let currentPoint = ipp;

            // let index = 0;
            // for (const key in loopOver) {
            //     if (loopOver.hasOwnProperty(key)) {
            //         const value = loopOver[key];

            //         const ldc = context.dc.createIteration(value, loopOver, key, index++);
            //         const cc = this.part(ldc, currentPoint);
            //         this.parts.push(cc);
            //         currentPoint = cc.getTail;
            //         //currentPoint = cc.context.appendPos.bind(cc.context)
            //         cc.insert();
            //     }
            // }

            // this.tail = currentPoint;
        }
    }

    private removeParts(index: number, count: number) {

        if (count === this.parts.length) {
            // we need to remove everything
            this.parts.forEach(p => p.dispose());
            this.parts = [];
            this.tail = this.head;
            return;
        }

        const removed = this.parts.splice(index, count);
        const topHead = removed[0].head;

        if (index < this.parts.length) {
            this.parts[index].updateHead(topHead);
            for (let i = index; i < this.parts.length; i++) {
                this.parts[i].dc.$index = i;
            }

        } else {
            this.tail = topHead;
        }
        removed.forEach(p => p.dispose());
    }

    private addParts(loopOver: any, index: number, items: any[]) {

        const dc = this.dc;
        const part = this.part;

        if (this.parts.length === 0) {
            // empty - just add
            this.tail = createSet(items, index, this.head, this.parts);

            if (this.attached) {
                this.parts.forEach(p => p.insert());
            }

            return;
        }

        if (this.parts.length <= index) {
            // append to the end
            this.tail = createSet(items, index, this.tail, this.parts);

            if (this.attached) {
                this.parts.forEach(p => p.insert());
            }

            return;
        }

        if (index === 0) {
            // insert at the front

            const newSet: Context[] = [];
            const tempTail = createSet(items, index, this.head, newSet);
            this.parts[index].head = tempTail;

            this.parts.splice(index, 0, ...newSet);

            applyIndex(this.parts, index + items.length);

            if (this.attached) {
                newSet.forEach(p => p.insert());
            }

            return;
        }

        // insert in between

        const newSet: Context[] = [];

        const tempTail = createSet(items, index, this.parts[index - 1].tail, newSet);

        this.parts[index].head = tempTail;

        this.parts.splice(index, 0, ...newSet);

        applyIndex(this.parts, index + items.length);

        if (this.attached) {
            newSet.forEach(p => p.insert());
        }



        function createSet(data: any[], startIndex: number, ipp: rt.InsertPointProvider, target: Context[]) {

            for (let index = 0; index < data.length; index++ , startIndex++) {
                const item = data[index];

                const ldc = dc.createIteration(item, loopOver, startIndex);
                const cc = part(ldc, ipp);
                target.push(cc);
                ipp = cc.getTail;
            }
            return ipp;
        }

        function applyIndex(parts: Context[], index: number) {
            for (; index < parts.length; index++) {
                parts[index].dc.$index = index;
            }
        }

    }



    insert() {
        if (!super.insert()) return;
        this.parts.forEach(p => p.insert());
        return true;
    }

    remove() {

        if (this.disposer) {
            this.disposer();
        }

        this.parts.forEach(p => p.remove())

        super.remove();
    }

    dispose() {
        this.remove();
        this.parts = [];
        super.dispose();
    }

}

export default LoopContext;