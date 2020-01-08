import { IReactionDisposer, autorun, isObservableArray, isObservableMap, isObservableObject, keys } from "mobx";

enum EventOptions {
    preventDefault = 0x0001,
    stopPropagation = 0x0002,
    stopImmediatePropagation = 0x0004,
    once = 0x0008,
    passive = 0x0010,
    capture = 0x0020
}

export declare type InsertPointProvider = () => ComponentInsertPosition;

export declare type ComponentInsertPosition = {
    element: Element | undefined | null,
    position: InsertPosition
};

export declare type Component = {

    appendPos: () => ComponentInsertPosition;
    insert: (host?: ComponentInsertPosition | undefined) => void;
    remove: () => void;
    dispose: () => void;
};


interface PartActions {
    insert: () => void;
    remove: () => void;
    dispose: () => void;
}


class PartSet implements PartActions {

    private switch?: (dc: DataContext) => any;
    private disposer?: IReactionDisposer;
    private parts: Component[] = [];
    private caseParts: ConditionalPart[] = [];
    private defParts: Component[] = [];
    public ipp: InsertPointProvider;


    constructor(params: CreatePartsParams, private dc: DataContext, ipp: InsertPointProvider) {

        this.switch = params.switch;

        let currentPoint = ipp;

        for (const item of params.parts) {
            if (typeof item === "function") {
                const partInst = item(dc, currentPoint);
                currentPoint = partInst.appendPos;
                this.parts.push(partInst);
            } else {

                const dataContext = item.dc === undefined
                    ? dc
                    : (typeof item.dc === "function")
                        ? item.dc(dc) :
                        item.dc;

                const partInst = item.part(dataContext, currentPoint);
                currentPoint = partInst.appendPos;

                if (item.when === undefined) {
                    this.parts.push(partInst);
                } else if (item.when === "default") {
                    this.defParts.push(partInst);
                } else {
                    this.caseParts.push({
                        part: partInst,
                        when: item.when,
                        order: item.order ?? 0
                    })
                }
            }
        }

        // sort conditions
        if (this.caseParts.length > 0) {
            this.caseParts = this.caseParts.sort(i => i.order);
        } else {
            this.parts.push(...this.defParts);
            this.defParts = [];
        }
        this.ipp = currentPoint;
    }

    insert() {
        this.parts.forEach(i => i.insert());

        if (this.caseParts.length > 0) {

            this.disposer = autorun(() => {

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
                    this.defParts.forEach(p => p.insert())
                }
                else {
                    this.defParts.forEach(p => p.remove())
                }
            });
        }
    }

    remove() {

        if (this.disposer) {
            this.disposer();
        }

        this.parts.forEach(p => p.remove())
        this.defParts.forEach(p => p.remove())
        this.caseParts.forEach(p => p.part.remove())
    }

    dispose() {
        this.remove();
    }
}

export class Context {
    private dc: DataContext;
    private disposed: boolean;
    private attached: boolean;
    private insertPoint: InsertPointProvider;
    private lastInsertPosition?: InsertPointProvider;
    private elements?: Element[];
    private events: EventContext[] = [];
    private disposers?: Array<() => void>;

    private partSets: PartActions[] = [];

    constructor(dc: DataContext, ipp: InsertPointProvider) {
        this.dc = dc;
        this.insertPoint = ipp;
        this.disposed = false;
        this.attached = false;
    }


    private dispose() {

        this.remove();
        this.elements = [];
        this.disposers?.forEach(d => d());
        this.events.forEach(e => e.element.removeEventListener(e.name, e.handler, e.options));
        this.partSets = [];
        this.disposed = true;
    }

    private remove() {
        if (this.elements) {
            for (const el of this.elements) {
                el.remove();
            }
        }

        this.partSets.forEach(ps => ps.remove());
        this.attached = false;
    }

    private insert(insertPosition?: ComponentInsertPosition | undefined) {
        if (this.disposed) return;

        this.attached = true;

        const provider = getInsertPointProvider(insertPosition);
        if (provider) {
            this.insertPoint = provider;
        }

        let { element, position } = this.insertPoint();


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

    private getSiblingInsertPoint(): ComponentInsertPosition {

        if (this.attached) {
            if (this.lastInsertPosition) {
                return this.lastInsertPosition();
            }
        }
        return this.insertPoint();
    }

    public static create(dc: DataContext, ipp: InsertPointProvider, params: CreateParams) {

        const context = new Context(dc, ipp);
        context.lastInsertPosition = context.insertPoint;

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
                context.lastInsertPosition = () => { return { element: lastChild, position: "afterend" } };
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
                                        element.nodeValue = value ? value.toString() : null;
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
            context.lastInsertPosition = ps.ipp;
            context.partSets.push(ps);
        }

        return {
            appendPos: () => context.getSiblingInsertPoint(),
            insert: (insertPoint?: ComponentInsertPosition | undefined) => context.insert(insertPoint),
            remove: () => context.remove(),
            dispose: () => context.dispose()
        };

    }
}

declare type CreateParams =
    (
        CreateTemplateParams |
        CreatePartsParams
    );



interface CreateTemplateParams {
    template: HTMLTemplateElement | string;
    attachTo?: ElementParams[];
    parts?: { [id: string]: PartFactory }
}
function isTemplateParams(params: CreateParams): params is CreateTemplateParams {
    return (params as any).template !== undefined;
}

interface CreatePartsParams {
    switch?: (dc: DataContext) => any,
    parts: Array<PartFactory | PartParams>
}
function isPartsParams(params: CreateParams): params is CreatePartsParams {
    return (params as any).parts !== undefined;
}

export declare type PartFactory = (dc: DataContext, ipp: InsertPointProvider) => Component;

interface PartParams {
    dc?: DataContext | ((dc: DataContext) => DataContext),
    part: PartFactory,
    when?: (($on: any, dc: DataContext) => boolean) | "default",
    order?: number
}

declare type ConditionalPart = {
    part: Component,
    when: ($on: any, da: DataContext) => boolean,
    order: number
};


interface ElementParams {
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

interface EventContext {
    element: Element;
    name: string;
    handler: (ev: Event) => void;
    options?: AddEventListenerOptions;
}

export interface DataContext {

    $data: any,
    $root: any,
    $parent?: DataContext,

    $collection?: any,
    $key?: any,
    $item?: any,
    $index?: number,

}










function isInsertPoint(item: ComponentInsertPosition | Element): item is ComponentInsertPosition {
    return ((item as any).nodeName === undefined);
}
export function getInsertPointProvider(insertPoint?: InsertPointProvider | ComponentInsertPosition | Element, defaultProvider?: InsertPointProvider) {

    if (insertPoint === undefined) return defaultProvider;

    if (typeof insertPoint === "function") {
        return insertPoint;
    }

    if (isInsertPoint(insertPoint)) {
        return () => insertPoint;
    }

    return () => { return { element: insertPoint, position: "beforeend" } as ComponentInsertPosition }
}



// #region helper methods

export function createTemplateSet(...contents: string[]) {

    return contents.map(
        content => {
            const template = document.createElement("template");
            template.innerHTML = content;
            return template;
        }
    )
}

export function createComponent(
    data: any | DataContext,
    host: null | undefined | Element | undefined | InsertPointProvider,
    componentFactory: (dataContext: DataContext, segmentInsertPoint: InsertPointProvider) => Component
): Component {

    // export function createComponent(
    //     data: any | DataContext,
    //     host: null | undefined | Element | InsertPointProvider | undefined,
    //     componentFactory: (dataContext: DataContext, segmentInsertPoint: InsertPointProvider) => Component
    // ) {
    if (data === undefined) throw new Error("data parameter is undefined");
    // if data is DataContext and host is InsertPointProvider, then we use it as a tempplate subcomponent
    // otherwise as a top level component
    if (isDataContext(data) && host !== undefined && typeof host === "function") {
        return componentFactory(data, host);
    }

    const ipp = (host !== undefined && typeof host === "function") ? host : () => { return { element: host, position: "beforeend" as InsertPosition } };

    const component = componentFactory(createDataContext(data), ipp);

    if (host) {
        component.insert();
    }

    return component;
}

export function createDataContext(data: any | DataContext, params?: {
    parent: DataContext,
    collection?: any,
    key?: any,
    item?: any,
    index?: number,
}): DataContext {

    if (data.$root !== undefined && data.$data !== undefined) {
        return data;
    }

    if (params) {
        const { parent, collection, key, item, index } = params;

        const context: DataContext = {
            $root: parent.$root,
            $data: data,
            $parent: parent,
            $collection: collection,
            $key: key,
            $item: item,
            $index: index
        }

        return context;

    } else {
        return {
            $root: data,
            $data: data,

        }
    }
}

function isDataContext(data: any): data is DataContext {
    return (data.$root !== undefined && data.$data !== undefined)
}
// #endregion helper methods



export function register(components: { [name: string]: number }, parts: Array<($pf: PartFactory[]) => CreateParams>) {

    const pf: PartFactory[] = [];
    const params: CreateParams[] = [];

    for (let index = 0; index < parts.length; index++) {
        const partParams = parts[index];

        pf.push((dc: DataContext, ipp: InsertPointProvider) => {

            if (params[index] === undefined) {
                params[index] = partParams(pf);
            }

            return Context.create(dc, ipp, params[index]);
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