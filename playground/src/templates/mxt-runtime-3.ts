import { IReactionDisposer, autorun, isObservableArray, isObservableMap, Lambda } from "mobx";


class PartSet implements PartActions {

    private dc: DataContext;
    private switch?: (dc: DataContext) => any;
    private disposer?: IReactionDisposer;
    private parts: Component[] = [];
    private caseParts?: ConditionalPart[];
    private defParts?: Component[];
    public tail: InsertPointProvider;


    constructor(params: PartsParams, dc: DataContext, ipp: InsertPointProvider) {

        this.dc = dc;
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
    }

    remove() {

        if (this.disposer) {
            this.disposer();
        }

        this.parts.forEach(p => p.remove())
        this.defParts?.forEach(p => p.remove())
        this.caseParts?.forEach(p => p.part.remove())
    }

    dispose() {
        this.remove();
    }
}

class LoopSet implements PartActions {

    forEach: (dc: DataContext) => any;
    part: PartFactory;
    parts: Component[] = [];
    disposer?: Lambda;
    tail: InsertPointProvider;



    constructor(params: LoopParams, context: Context, ipp: InsertPointProvider) {
        this.forEach = params.forEach;
        this.part = params.part;
        this.tail = ipp;

        const dc = context.dc;

        const loopOver = this.forEach(dc);

        if (isObservableArray(loopOver)) {

            this.disposer = loopOver.observe((change) => {

                if (change.type == "splice") {
                    if (change.removedCount > 0) {
                        if (change.removedCount === this.parts.length) {
                            // we need to remove everything
                            this.parts.forEach(p => p.remove());
                            this.parts = [];
                        }

                        // remove parts
                        // if the last part removed, update ipp to the last visible
                        // update indexes in DataContex
                    }

                    if (change.addedCount > 0) {

                        // get parts[index-1]
                        // create and insert new parts, chained after the parts[index-1]
                        // re-insert parts[index+addedCount] chaned after the last one
                        // update indexes in DataContext
                    }
                }


                // splice	index	starting index of the splice.Splices are also fired by push, unshift, replace etc.√
                // removedCount	amount of items being removed	√	√
                // added	array with items being added	√	√
                // removed	array with items that were removed
                // addedCount	amount of items that were added

                // update	index	index of the single entry that is being updated	√
                // newValue	the newValue that is / will be assigned	√	√
                // oldValue	the old value that was replaced

                console.info("array change detected");
                console.info(change.object);
                console.info(change.index);
                console.info(change.type);
                this.tail = ipp;

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

            let currentPoint = ipp;

            for (let index = 0; index < loopOver.length; index++) {
                const ldc = context.dc.createIteration(loopOver[index], loopOver, index.toString(), index);
                const cc = this.part(ldc, currentPoint);
                this.parts.push(cc);
                currentPoint = cc.getTail;
                //currentPoint = cc.context.appendPos.bind(cc.context)
                cc.insert();
            }

            this.tail = currentPoint;

        } else {
            // regular object

            let currentPoint = ipp;

            let index = 0;
            for (const key in loopOver) {
                if (loopOver.hasOwnProperty(key)) {
                    const value = loopOver[key];

                    const ldc = context.dc.createIteration(value, loopOver, key, index++);
                    const cc = this.part(ldc, currentPoint);
                    this.parts.push(cc);
                    currentPoint = cc.getTail;
                    //currentPoint = cc.context.appendPos.bind(cc.context)
                    cc.insert();
                }
            }

            this.tail = currentPoint;
        }
    }

    insert() { }

    remove() {

        if (this.disposer) {
            this.disposer();
        }

        this.parts.forEach(p => p.remove())
    }

    dispose() {
        this.remove();
        this.parts = [];
    }

}

class Context {
    dc: DataContext;
    disposed: boolean;
    attached: boolean;
    head: InsertPointProvider;
    tail?: InsertPointProvider;
    elements?: Element[];
    events: EventContext[] = [];
    disposers?: Array<() => void>;

    partSets: PartActions[] = [];

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
        this.disposed = false;
        this.attached = false;
    }


    dispose() {

        this.remove();
        this.elements = [];
        this.disposers?.forEach(d => d());
        this.events.forEach(e => e.element.removeEventListener(e.name, e.handler, e.options));
        this.partSets = [];
        this.disposed = true;
    }

    remove() {
        if (this.elements) {
            for (const el of this.elements) {
                el.remove();
            }
        }

        this.partSets.forEach(ps => ps.remove());
        this.attached = false;
    }

    insert(insertPosition?: ComponentInsertPosition | undefined) {
        if (this.disposed) return;

        this.attached = true;

        const provider = this.getInsertPointProvider(insertPosition);
        if (provider) {
            this.head = provider;
        }

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

        this.partSets.forEach(ps => ps.insert());

        this.attached = true;
    }

    getInsertPointProvider(insertPoint?: InsertPointProvider | ComponentInsertPosition | Element, defaultProvider?: InsertPointProvider) {

        if (insertPoint === undefined) return defaultProvider;

        if (typeof insertPoint === "function") {
            return insertPoint;
        }

        if (isInsertPoint(insertPoint)) {
            return () => insertPoint;
        }

        return () => { return { element: insertPoint, position: "beforeend" } as ComponentInsertPosition }

        function isInsertPoint(item: ComponentInsertPosition | Element): item is ComponentInsertPosition {
            return ((item as any).nodeName === undefined);
        }
    }




}


declare type InsertPointProvider = () => ComponentInsertPosition;

declare type ComponentInsertPosition = {
    element: Element | undefined | null,
    position: InsertPosition
};



declare type Component = {

    insert: (host?: ComponentInsertPosition | undefined) => void;
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
    $key?: any;
    $index?: number;

    constructor(data: any, parent?: DataContext) {
        this.$root = parent !== undefined ? parent.$root : data;
        this.$data = data;
        this.$parent = parent;
    }

    create(data: any) {
        return new DataContext(data, this);
    }
    createIteration(data: any, collection: any, key: any, index: number) {
        const dc = new DataContext(data, this);
        dc.$collection = collection;
        dc.$key = key;
        dc.$index = index;
        return dc;
    }
}

export function register(components: { [name: string]: number }, parts: Array<($pf: PartFactory[]) => CreateParams>) {

    const pf: PartFactory[] = [];
    const params: CreateParams[] = [];

    for (let index = 0; index < parts.length; index++) {
        const partParams = parts[index];

        pf.push((dc: DataContext, ipp: InsertPointProvider) => {

            if (params[index] === undefined) {
                params[index] = partParams(pf);
            }

            return create(dc, ipp, params[index]);
        });
    }

    const exports: {
        [name: string]: (data: any, host?: null | undefined | Element | InsertPointProvider) => Component
    } = {};

    for (const name in components) {
        if (components.hasOwnProperty(name)) {
            const index = components[name];
            exports[name] = (data, host) => {
                return createComponent(data, host, pf[index]);
            }
        }
    }

    return exports;
}

function isDataContext(data: any): data is DataContext {
    return data instanceof DataContext;
}

function createComponent(
    data: any | DataContext,
    host: null | undefined | Element | undefined | InsertPointProvider,
    componentFactory: (dataContext: DataContext, segmentInsertPoint: InsertPointProvider) => Component
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
        insert: (insertPoint?: ComponentInsertPosition | undefined) => context.insert(insertPoint),
        remove: () => context.remove(),
        dispose: () => context.dispose()
    };


    if (host) {
        component.insert();
    }

    return component;
}

function create(dc: DataContext, ipp: InsertPointProvider, params: CreateParams) {

    const context = new Context(dc, ipp);
    context.tail = context.head;

    if (isTemplateParams(params)) {

        if (typeof params.template === "string") {
            const content = params.template;
            params.template = document.createElement("template");
            params.template.innerHTML = content;
        }

        const content = params.template.content.cloneNode(true) as DocumentFragment;
        let child = content.firstElementChild;
        if (child) {
            context.elements = [];
            let lastChild = child;
            while (child) {
                context.elements.push(child);
                lastChild = child;
                child = child.nextElementSibling;
            }
            context.tail = () => { return { element: lastChild, position: "afterend" } };
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
                        context.disposers = context.disposers ?? [];
                        context.disposers.push(
                            autorun(() => {

                                if (item.attrs !== undefined) {
                                    const attrs = item.attrs(context.dc);
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
                                    const value = item.value(context.dc);
                                    element.innerText = value ? value.toString() : null;
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
                                    e.handler(ev, context.dc);
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
                            context.events.push(eventContext);
                        }
                    }
                }
            }
        }

        if (params.parts) {
            for (const itemId in params.parts) {
                if (params.parts.hasOwnProperty(itemId)) {
                    const element = content.getElementById(itemId);
                    if (element) {
                        context.partSets.push(params.parts[itemId](dc, () => { return { element, position: "beforeend" } }));
                    }
                }
            }
        }

    } else if (isPartsParams(params)) {
        const ps = new PartSet(params, dc, ipp);
        context.tail = ps.tail;
        context.partSets.push(ps);
    } else if (isLoopParams(params)) {
        const ps = new LoopSet(params, context, ipp);
        context.tail = ps.tail;
        context.partSets.push(ps);
    }

    return context;
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
    parts?: { [id: string]: PartFactory }
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