import { IReactionDisposer, autorun, isObservableArray, isObservableMap, Lambda, observable } from "mobx";

class Context {
    dc: DataContext;
    disposed: boolean;
    attached: boolean;
    head: InsertPointProvider;
    tail: InsertPointProvider;

    getTail: () => ComponentInsertPosition = () => {
        if (this.attached) {
            if (this.tail) {
                return this.tail();
            }
        }
        return this.head();
    }

    constructor(dc: DataContext, ipp: InsertPointProvider) {
        this.dc = dc;
        this.head = ipp;
        this.tail = ipp;
        this.disposed = false;
        this.attached = false;
    }

    updateHead(ipp?: Element | ComponentInsertPosition | InsertPointProvider | undefined | null) {

        if (!ipp) {
            return;
        }
        if (typeof ipp === "function") {
            this.head = ipp;
        } else if (isInsertPoint(ipp)) {
            this.head = () => ipp;
        } else {
            this.head = () => { return { element: ipp, position: "beforeend" } as ComponentInsertPosition }
        }

        function isInsertPoint(item: ComponentInsertPosition | Element): item is ComponentInsertPosition {
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

class TemplateContext extends Context {

    elements: Element[] = [];
    events: EventContext[] = [];
    disposers: Array<() => void> = [];
    parts: PartActions[] = [];

    constructor(params: TemplateParams, dc: DataContext, ipp: InsertPointProvider) {
        super(dc, ipp);

        if (typeof params.template === "string") {
            const content = params.template;
            params.template = document.createElement("template");
            params.template.innerHTML = content;
        }

        let currentIpp = ipp;

        const content = params.template.content.cloneNode(true) as DocumentFragment;
        let child = content.firstElementChild;
        if (child) {
            let lastChild = child;
            while (child) {
                this.elements.push(child);
                lastChild = child;
                child = child.nextElementSibling;
            }
            currentIpp = () => { return { element: lastChild, position: "afterend" } };
        }

        if (params.attachTo) {

            for (const item of params.attachTo) {

                const element = content.getElementById(item.id);

                if (element) {

                    if (item.originalId) {
                        element.id = item.originalId;
                    } else {
                        element.removeAttribute("id");
                    }

                    if (item.attrs !== undefined || item.value !== undefined) {
                        this.disposers = this.disposers ?? [];
                        this.disposers.push(
                            autorun(() => {

                                if (item.attrs !== undefined) {
                                    const attrs = item.attrs(this.dc);
                                    for (const key in attrs) {
                                        if (attrs.hasOwnProperty(key)) {
                                            const value = attrs[key];
                                            if (value) {
                                                element.setAttribute(key, value.toString());
                                            } else {
                                                element.removeAttribute(key);
                                            }
                                        }
                                    }
                                }

                                if (item.value !== undefined) {
                                    const value = item.value(this.dc);
                                    element.innerText = value !== undefined ? value.toString() : null;
                                }
                            }));
                    }

                    if (item.events !== undefined) {
                        for (let index = 0; index < item.events.length; index++) {
                            const e = item.events[index];
                            const flags = e.flags ?? 0;
                            const eventContext: EventContext = {
                                element,
                                name: e.name,
                                handler: (ev: Event) => {
                                    e.handler(ev, this.dc);
                                    if (flags & 0x0001) ev.preventDefault();
                                    if (flags & 0x0002) ev.stopPropagation();
                                    if (flags & 0x0004) ev.stopImmediatePropagation();
                                },
                                options: {
                                    once: !!(flags & 0x0008),
                                    passive: !!(flags & 0x0010),
                                    capture: !!(flags & 0x0020),
                                }
                            };

                            element.addEventListener(eventContext.name, eventContext.handler, eventContext.options);
                            this.events.push(eventContext);
                        }
                    }
                }
            }
        }

        if (params.embed) {
            for (const itemId in params.embed) {
                if (params.embed.hasOwnProperty(itemId)) {
                    const element = content.getElementById(itemId);
                    if (element) {
                        this.parts.push(params.embed[itemId](dc, () => { return { element, position: "beforeend" } }));
                    }
                }
            }
        }

        this.tail = currentIpp;
    }

    insert() {
        if (!super.insert()) return;

        let { element, position } = this.head();

        if (element && this.elements && this.elements.length > 0) {
            let inserted = element.insertAdjacentElement(position, this.elements[0]);
            if (inserted) {
                element = inserted;
                position = "afterend";

                for (let index = 1; index < this.elements.length; index++) {
                    const el = this.elements[index];
                    inserted = element.insertAdjacentElement(position, el);
                    if (inserted) {
                        element = inserted
                    }
                }
            }
        }

        this.parts.forEach(ps => ps.insert());

        return true;
    }

    dispose() {
        this.elements = [];
        this.disposers.forEach(d => d());
        this.events.forEach(e => e.element.removeEventListener(e.name, e.handler, e.options));
        this.parts = [];
        super.dispose();
    }

    remove() {
        if (this.elements) {
            for (const el of this.elements) {
                el.remove();
            }
        }

        this.parts.forEach(ps => ps.remove());
        super.remove();
    }
}

class PartsContext extends Context {

    private switch?: (dc: DataContext) => any;
    private disposer?: IReactionDisposer;
    private parts: Component[] = [];
    private caseParts?: ConditionalPart[];
    private defParts?: Component[];


    constructor(params: PartsParams, dc: DataContext, ipp: InsertPointProvider) {
        super(dc, ipp);

        if (params.switch) {
            this.switch = params.switch;
        }

        let currentPoint = ipp;

        const defParts: Component[] = [];
        const caseParts: ConditionalPart[] = [];

        for (const item of params.parts) {

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

class LoopContext extends Context {

    forEach: (dc: DataContext) => any;
    part: PartFactory;
    parts: Context[] = [];
    disposer?: Lambda;

    constructor(params: LoopParams, dc: DataContext, ipp: InsertPointProvider) {
        super(dc, ipp);

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



        function createSet(data: any[], startIndex: number, ipp: InsertPointProvider, target: Context[]) {

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




declare type InsertPointProvider = () => ComponentInsertPosition;

declare type ComponentInsertPosition = {
    element: Element | undefined | null,
    position: InsertPosition
};



declare type Component = {

    insert: (host?: Element | ComponentInsertPosition | undefined | null) => void;
    remove: () => void;
    dispose: () => void;
};


interface PartActions {
    insert: () => void;
    remove: () => void;
    dispose: () => void;
}

declare type ConditionalPart = {
    part: Component,
    when: ($on: any, da: DataContext) => boolean,
    order: number
};


interface EventContext {
    element: Element;
    name: string;
    handler: (ev: Event) => void;
    options?: AddEventListenerOptions;
}


class DataContext {
    $root: any;
    $data: any;
    $parent?: DataContext;
    $collection?: any;
    @observable $key?: any;
    @observable $index?: number;

    constructor(data: any, parent?: DataContext) {
        this.$root = parent !== undefined ? parent.$root : data;
        this.$data = data;
        this.$parent = parent;
    }

    create(data: any) {
        return new DataContext(data, this);
    }
    createIteration(data: any, collection: any, index: number, key?: any) {
        const dc = new DataContext(data, this);
        dc.$collection = collection;
        dc.$index = index;
        dc.$key = key ?? index.toString();
        return dc;
    }
}

export function register(regParams: {
    exports: { [name: string]: string },
    parts: { [name: string]: (($pf: { [name: string]: PartFactory }) => CreateParams) | string },
    imports?: { [name: string]: (data: any, host?: Element | InsertPointProvider | null | undefined) => Component }
}) {
    const { exports, parts, imports } = regParams;

    const pf: { [name: string]: PartFactory } = {};
    const params: { [name: string]: CreateParams } = {};

    if (imports) {
        for (const importKey in imports) {
            if (imports.hasOwnProperty(importKey)) {
                const importItem = imports[importKey] as any;
                if (importItem.component) {
                    pf[importKey] = importItem.component;
                }
            }
        }
    }


    for (const pfKey in parts) {
        if (parts.hasOwnProperty(pfKey)) {
            const partParams = parts[pfKey];

            pf[pfKey] = ((dc: DataContext, ipp: InsertPointProvider) => {

                if (params[pfKey] === undefined) {
                    params[pfKey] = (typeof partParams === "string")
                        ? { template: partParams }
                        : partParams(pf);
                }
                const cp = params[pfKey];

                if (isTemplateParams(cp)) {
                    return new TemplateContext(cp, dc, ipp);
                }
                if (isPartsParams(cp)) {
                    return new PartsContext(cp, dc, ipp);
                }
                //if (isLoopParams(cp)) 
                {
                    return new LoopContext(cp, dc, ipp);
                }
            });


        }
    }

    const exp: {
        [name: string]: (data: any, host?: null | undefined | Element | InsertPointProvider) => Component
    } = {};

    for (const name in exports) {
        if (exports.hasOwnProperty(name)) {
            const index = exports[name];
            exp[name] = (data, host) => {
                return createComponent(data, host, pf[index]);
            }
            (exp[name] as any).component = pf[index];
        }
    }

    return exp;
}

function isDataContext(data: any): data is DataContext {
    return data instanceof DataContext;
}

function createComponent(
    data: any | DataContext,
    host: null | undefined | Element | InsertPointProvider,
    componentFactory: (dataContext: DataContext, segmentInsertPoint: InsertPointProvider) => Context
): Component {

    if (data === undefined) throw new Error("data parameter is undefined");

    const dc = isDataContext(data) ? data : new DataContext(data);

    // if data is DataContext and host is InsertPointProvider, then we use it as a tempplate subcomponent
    // otherwise as a top level component
    if (isDataContext(data) && host !== undefined && typeof host === "function") {
        return componentFactory(dc, host);
    }

    const ipp = (host !== undefined && typeof host === "function") ? host : () => { return { element: host, position: "beforeend" as InsertPosition } };

    const context = componentFactory(dc, ipp);

    const component = {
        insert: (insertPoint?: Element | ComponentInsertPosition | undefined | null) => {

            context.updateHead(insertPoint);
            context.insert();
        },
        remove: () => context.remove(),
        dispose: () => context.dispose()
    };


    if (host) {
        component.insert();
    }

    return component;
}

function isTemplateParams(params: CreateParams): params is TemplateParams {
    return (params as any).template !== undefined;
}
function isPartsParams(params: CreateParams): params is PartsParams {
    return (params as any).parts !== undefined;
}
function isLoopParams(params: CreateParams): params is LoopParams {
    return (params as any).forEach !== undefined;
}


declare type CreateParams =
    (
        TemplateParams |
        PartsParams |
        LoopParams
    );

interface TemplateParams {
    template: HTMLTemplateElement | string;
    attachTo?: AttachParams[];
    embed?: { [id: string]: PartFactory }
}

interface AttachParams {
    id: string,
    originalId?: string,
    attrs?: (dc: DataContext) => { [name: string]: any },
    value?: (dc: DataContext) => any,
    events?: EventParams[]
}


interface EventParams {
    name: string,
    handler: (ev: Event, dc: DataContext) => void,
    flags?: number
}

// Event Flags
//   preventDefault = 0x0001,
//   stopPropagation = 0x0002,
//   stopImmediatePropagation = 0x0004,
//   once = 0x0008,
//   passive = 0x0010,
//   capture = 0x0020


declare type PartFactory = (dc: DataContext, ipp: InsertPointProvider) => Context;

interface PartsParams {
    switch?: (dc: DataContext) => any,
    parts: Array<PartFactory | PartParams>
}

interface PartParams {
    dc?: DataContext | ((dc: DataContext) => DataContext),
    part: PartFactory,
    when?: (($on: any, dc: DataContext) => boolean) | "default",
    order?: number
}

interface LoopParams {
    forEach: (dc: DataContext) => any,
    part: PartFactory
}