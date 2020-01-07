import { IReactionDisposer, autorun, isObservableArray, isObservableMap, isObservableObject, keys } from "mobx";

export declare type InsertPointProvider = () => ComponentInsertPosition;

export declare type ComponentInsertPosition = {
    element: Element | undefined | null,
    position: InsertPosition
};

export declare type Component = {

    siblingInsertPoint: () => ComponentInsertPosition;
    insert: (host?: ComponentInsertPosition | undefined) => void;
    remove: () => void;
    dispose: () => void;
};


export class Context {
    private disposed: boolean;
    private attached: boolean;
    private insertPoint: InsertPointProvider;
    private lastInsertPosition?: InsertPointProvider;
    private parent?: Context;
    private collection?: any;
    private key?: any;
    private item?: any;
    private index?: number;
    private data: any;

    private switchCondition?: () => boolean;
    private switchAutorun?: IReactionDisposer;

    private elements?: Element[];
    private components?: Component[];
    private staticComponents?: Component[];
    private conditionalComponents?: ConditionalComponent[];
    private defaultconditionalComponents?: Component[];
    private readonly activeElements?: { [id: string]: ElementContext };


    constructor(params: CreateCommonParams) {

        this.parent = params.parent;
        this.insertPoint = params.insertPointProvider;
        this.disposed = false;
        this.attached = false;
    }


    private dispose() {

        this.remove();
        this.elements?.splice(-1);

        for (const elementId in this.activeElements) {
            if (this.activeElements.hasOwnProperty(elementId)) {
                const element = this.activeElements[elementId];

                if (element.autorun) {
                    element.autorun();
                }

                if (element.events) {
                    for (const event of element.events) {
                        removeEventListener(event.name, event.handler);
                    }
                }
            }
        }


        this.conditionalComponents = [];
        this.defaultconditionalComponents = [];
        this.staticComponents = [];


        this.disposed = true;
    }

    private remove() {
        if (this.elements) {
            for (const el of this.elements) {
                el.remove();
            }
        } else if (this.components) {
            for (const el of this.components) {
                el.remove();
            }
        }

        if (this.switchAutorun) {
            this.switchAutorun();
        }

        this.conditionalComponents?.forEach(i => i.component.remove());
        this.defaultconditionalComponents?.forEach(i => i.remove());
        this.staticComponents?.forEach(i => i.remove());
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

        if (this.components) {
            for (const component of this.components) {
                component.insert();
            }
        }

        if (this.staticComponents) {
            for (const component of this.staticComponents) {
                component.insert();
            }
        }

        if ((this.conditionalComponents && this.conditionalComponents.length > 0) || (this.defaultconditionalComponents && this.defaultconditionalComponents.length > 0)) {
            this.switchAutorun = autorun(() => {

                const $on = (this.switchCondition === undefined) ? undefined : this.switchCondition();

                let hasDefault = true;
                if (this.conditionalComponents) {
                    for (const component of this.conditionalComponents) {

                        if (component.condition($on)) {
                            hasDefault = false;
                            component.component.insert();
                        } else {
                            component.component.remove();
                        }
                    }
                }

                if (this.defaultconditionalComponents) {
                    if (hasDefault) {
                        for (const component of this.defaultconditionalComponents) {
                            component.insert();
                        }
                    }
                    else {
                        for (const component of this.defaultconditionalComponents) {
                            component.remove();
                        }
                    }
                }
            });

        }

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

    public static create(params: CreateParams) {

        const context = new Context(params);

        if (isTemplateParams(params)) {

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
                context.lastInsertPosition = () => {
                    return {
                        element: lastChild,
                        position: "afterend"
                    }
                }
            }

            if (params.attachTo) {

                for (const item of params.attachTo) {

                    const element = content.getElementById(item.id);

                    if (element) {

                        const activeElement: ElementContext = {
                            element,
                            events: item.events
                        }

                        if (item.originalId) {
                            element.id = item.originalId;
                        } else {
                            element.removeAttribute("id");
                        }

                        if (item.attributeSetter !== undefined || item.textSetter !== undefined) {
                            activeElement.autorun = autorun(() => {
                                if (item.attributeSetter) item.attributeSetter(element);
                                if (item.textSetter) item.textSetter(element);
                            })
                        }

                        if (item.events) {
                            for (const event of item.events) {
                                element.addEventListener(event.name, event.handler, event.options);
                            }
                        }

                        if (item.components) {
                            context.components = [];

                            let currentPoint: InsertPointProvider = () => {
                                return {
                                    element,
                                    position: "beforeend"
                                }
                            };

                            for (const component of item.components) {
                                const componentConfig = component(currentPoint);
                                context.components.push(componentConfig.component);
                                currentPoint = componentConfig.component.siblingInsertPoint;
                            }
                        }
                    }

                }

            }

        } else if (isContainerParams(params)) {

            context.switchCondition = params.switchCondition;

            context.staticComponents = [];
            context.defaultconditionalComponents = [];
            context.conditionalComponents = [];

            let currentPoint = params.insertPointProvider;


            const componentConfigs: ComponentConfig[] = [];

            for (const component of params.components) {
                const componentConfig = component(currentPoint);
                componentConfigs.push(componentConfig);
                currentPoint = componentConfig.component.siblingInsertPoint;
                context.lastInsertPosition = currentPoint;
            }


            for (const componentConfig of componentConfigs) {

                if (componentConfig.condition === undefined) {
                    context.staticComponents.push(componentConfig.component);
                } else if (componentConfig.condition === "default") {
                    context.defaultconditionalComponents.push(componentConfig.component);
                } else if (typeof componentConfig.condition === "function") {

                    context.conditionalComponents.push(
                        {
                            component: componentConfig.component,
                            condition: componentConfig.condition,
                            conditionOrder: componentConfig.conditionOrder ?? 0
                        });
                }
            }

            // sort conditions
            context.conditionalComponents = context.conditionalComponents.sort((i) => i.conditionOrder ? i.conditionOrder : 0);
        }

        return {
            siblingInsertPoint: () => context.getSiblingInsertPoint(),
            insert: (insertPoint?: ComponentInsertPosition | undefined) => context.insert(insertPoint),
            remove: () => context.remove(),
            dispose: () => context.dispose()
        };

    }
}

declare type CreateParams = CreateCommonParams & (CreateTemplateParams | CreateContainerParams);

interface CreateCommonParams {
    parent?: Context,
    insertPointProvider: InsertPointProvider,
}

interface CreateTemplateParams {
    template: HTMLTemplateElement,
    attachTo?: ElementParams[]
}
function isTemplateParams(params: CreateParams): params is CreateCommonParams & CreateTemplateParams {
    return (params as any).template !== undefined;
}

function isContainerParams(params: CreateParams): params is CreateCommonParams & CreateContainerParams {
    return (params as any).components !== undefined;
}

interface CreateContainerParams {
    switchCondition?: () => any,
    components: Array<(insertPoint: InsertPointProvider) => ComponentConfig>
}




interface ElementParams {
    id: string,
    originalId: string,
    attributeSetter?: (element: Element) => void,
    textSetter?: (element: Element) => void,
    events?: EventContext[],
    components?: Array<(insertPoint: InsertPointProvider) => ComponentConfig>
}
interface EventParams {
    name: string,
    handler: (ev: Event) => void,
    options?: AddEventListenerOptions
}

interface ElementContext {
    element: Element;
    autorun?: IReactionDisposer;
    events?: EventContext[];
}
interface EventContext {
    name: string,
    handler: (ev: Event) => void,
    options?: AddEventListenerOptions
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






declare type ComponentConfig = {
    component: Component,
    condition?: (($on: any) => boolean) | "default",
    conditionOrder?: number
};

declare type ConditionalComponent = {
    component: Component,
    condition: ($on: any) => boolean,
    conditionOrder: number
};

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

export function getInsertPoint(insertPoint?: InsertPointProvider | ComponentInsertPosition | Element): ComponentInsertPosition {

    if (insertPoint !== undefined) {

        if (typeof insertPoint === "function") {
            return insertPoint();
        }

        if (isInsertPoint(insertPoint)) {

            return insertPoint;
        }
    }

    return { element: insertPoint, position: "beforeend" };
}

// #region loop

// export function createloop(
//     dataContext: DataContext,
//     parentInsertPoint: InsertPointProvider,
//     over: () => any,
//     componentConfig: (insertPoint: InsertPointProvider) => ComponentConfig) {

//     const context: LoopContext = {
//         containerInsertPoint: parentInsertPoint,
//         over,
//         componentConfigFactory: componentConfig,

//         disposed: false,
//         attached: false,
//     }

//     let currentPoint = parentInsertPoint;

//     context.over = over();
//     // over can be:
//     // Observable array
//     // Observable object
//     // Observable Map
//     // Simple, static array
//     // Simple, static object

//     const componentConfigs: ComponentConfig[] = [];


//     if (isObservableArray(context.over)) {
//     } else if (isObservableMap(context.over)) {
//     } else if (isObservableObject(context.over)) {
//     } else if (Array.isArray(context.over)) {

//         for (let index = 0; index < context.over.length; index++) {
//             const value = context.over[index];
//             const valueContext = createDataContext(value, { parent: dataContext, key: index.toString(), index: index });

//             const cc = componentConfig(valueContext, currentPoint);
//             componentConfigs.push(cc);
//             currentPoint = cc.component.insertPoint;
//             context.lastComponent = cc.component;
//         }
//     } else {
//         // regular object
//         let index = 0;
//         for (const key in context.over) {
//             if (context.over.hasOwnProperty(key)) {
//                 const value = context.over[key];
//                 const valueContext = createDataContext(value, { parent: dataContext, key: key, index: index++ });

//                 const cc = componentConfig(valueContext, currentPoint);
//                 componentConfigs.push(cc);
//                 currentPoint = cc.component.insertPoint;
//                 context.lastComponent = cc.component;
//             }
//         }

//     }


//     return {
//         insertPoint: () => getContainerInsertPoint(context),
//         insert: (insertPosition?: ComponentInsertPosition | Element) => insertComponent(insertPosition),
//         remove: () => removeContainer(context),
//         dispose: () => disposeContainer(context)
//     };

//     function getContainerInsertPoint(context: ContainerContext): ComponentInsertPosition {

//         if (context.lastComponent) {
//             return context.lastComponent.insertPoint();
//         }
//         return context.containerInsertPoint();
//     }

//     function insertComponent(insertPosition?: ComponentInsertPosition | Element) {
//         context.attached = true;

//         const provider = getInsertPointProvider(insertPosition);
//         if (provider) {
//             context.containerInsertPoint = provider;
//         }

//         for (const component of context.staticComponents) {
//             component.insert();
//         }

//         if (context.conditionalComponents.length > 0 || context.defaultconditionalComponents.length > 0) {
//             context.autorun = autorun(() => {

//                 const $on = (context.switchCondition === undefined) ? undefined : context.switchCondition();

//                 let hasDefault = true;
//                 for (const component of context.conditionalComponents) {

//                     if (component.condition($on)) {
//                         hasDefault = false;
//                         component.component.insert();
//                     } else {
//                         component.component.remove();
//                     }
//                 }

//                 if (hasDefault) {
//                     for (const component of context.defaultconditionalComponents) {
//                         component.insert();
//                     }
//                 }
//                 else {
//                     for (const component of context.defaultconditionalComponents) {
//                         component.remove();
//                     }
//                 }

//             });

//         }
//     }

//     function removeContainer(context: ContainerContext) {
//         if (context.autorun) {
//             context.autorun();
//         }

//         context.conditionalComponents.forEach(i => i.component.remove());
//         context.defaultconditionalComponents.forEach(i => i.remove());
//         context.staticComponents.forEach(i => i.remove());
//         context.attached = false;
//     }

//     function disposeContainer(context: ContainerContext) {
//         removeContainer(context);
//         context.conditionalComponents = [];
//         context.defaultconditionalComponents = [];
//         context.staticComponents = [];
//         context.disposed = true;
//     }
// }

export interface LoopContext {
    lastComponent?: Component,

    containerInsertPoint: InsertPointProvider,
    over: any,
    componentConfigFactory: (insertPoint: InsertPointProvider) => ComponentConfig,
    disposed: boolean,
    attached: boolean,
}

export function createloop(
    dataContext: DataContext,
    parentInsertPoint: InsertPointProvider,
    over: () => any,
    componentConfig: (insertPoint: InsertPointProvider) => ComponentConfig) {

}



// #endregion loop

// #region container

export function createContainer(
    parentInsertPoint: InsertPointProvider,
    components: Array<(insertPoint: InsertPointProvider, parentContext?: ContainerContext) => ComponentConfig>,
    switchCondition?: () => any) {

    const context: ContainerContext = {
        containerInsertPoint: parentInsertPoint,
        switchCondition,
        staticComponents: [],
        conditionalComponents: [],
        defaultconditionalComponents: [],
        disposed: false,
        attached: false,
    }

    let currentPoint = parentInsertPoint;


    const componentConfigs: ComponentConfig[] = [];

    for (const component of components) {
        const componentConfig = component(currentPoint, context);
        componentConfigs.push(componentConfig);
        currentPoint = componentConfig.component.siblingInsertPoint;
        context.lastComponent = componentConfig.component;
    }

    componentConfigs.reduce((context, componentConfig) => {

        if (componentConfig.condition === undefined) {
            context.staticComponents.push(componentConfig.component);
        } else if (componentConfig.condition === "default") {
            context.defaultconditionalComponents.push(componentConfig.component);
        } else if (typeof componentConfig.condition === "function") {

            context.conditionalComponents.push(
                {
                    component: componentConfig.component,
                    condition: componentConfig.condition,
                    conditionOrder: componentConfig.conditionOrder ?? 0

                });
        }

        return context;
    }, context);

    // sort conditions
    context.conditionalComponents = context.conditionalComponents.sort((i) => i.conditionOrder ? i.conditionOrder : 0);

    return {
        insertPoint: () => getContainerInsertPoint(context),
        insert: (insertPosition?: ComponentInsertPosition | Element) => insertComponent(insertPosition),
        remove: () => removeContainer(context),
        dispose: () => disposeContainer(context)
    };

    function getContainerInsertPoint(context: ContainerContext): ComponentInsertPosition {

        if (context.lastComponent) {
            return context.lastComponent.siblingInsertPoint();
        }
        return context.containerInsertPoint();
    }

    function insertComponent(insertPosition?: ComponentInsertPosition | Element) {
        context.attached = true;

        const provider = getInsertPointProvider(insertPosition);
        if (provider) {
            context.containerInsertPoint = provider;
        }

        for (const component of context.staticComponents) {
            component.insert();
        }

        if (context.conditionalComponents.length > 0 || context.defaultconditionalComponents.length > 0) {
            context.autorun = autorun(() => {

                const $on = (context.switchCondition === undefined) ? undefined : context.switchCondition();

                let hasDefault = true;
                for (const component of context.conditionalComponents) {

                    if (component.condition($on)) {
                        hasDefault = false;
                        component.component.insert();
                    } else {
                        component.component.remove();
                    }
                }

                if (hasDefault) {
                    for (const component of context.defaultconditionalComponents) {
                        component.insert();
                    }
                }
                else {
                    for (const component of context.defaultconditionalComponents) {
                        component.remove();
                    }
                }

            });

        }
    }

    function removeContainer(context: ContainerContext) {
        if (context.autorun) {
            context.autorun();
        }

        context.conditionalComponents.forEach(i => i.component.remove());
        context.defaultconditionalComponents.forEach(i => i.remove());
        context.staticComponents.forEach(i => i.remove());
        context.attached = false;
    }

    function disposeContainer(context: ContainerContext) {
        removeContainer(context);
        context.conditionalComponents = [];
        context.defaultconditionalComponents = [];
        context.staticComponents = [];
        context.disposed = true;
    }
}


export interface ContainerContext {
    autorun?: IReactionDisposer,
    containerInsertPoint: InsertPointProvider,
    lastComponent?: Component,
    switchCondition?: () => any,

    staticComponents: Component[],
    conditionalComponents: ConditionalComponent[],
    defaultconditionalComponents: Component[],

    disposed: boolean,
    attached: boolean,
}

// #endregion container

// #region segments

export function createSegment(template: HTMLTemplateElement, parameters: SegmentParameters) {

    const context: SegmentContext = {
        segmentInsertPoint: parameters.segmentInsertPoint,
        disposed: false,
        attached: false,
        elements: [],
        components: [],
        activeElements: {}

    };

    const content = template.content.cloneNode(true) as DocumentFragment;
    let child = content.firstElementChild;
    while (child) {
        context.elements.push(child);
        child = child.nextElementSibling;
    }

    const elements = parameters.elements;

    for (const elementId in elements) {
        if (elements.hasOwnProperty(elementId)) {
            const elementParameters = elements[elementId];
            const element = content.getElementById(elementId);
            if (element) {

                const activeElement: ElementContext = {
                    element,
                    events: elementParameters.events
                }

                element.id = elementParameters.originalId;

                if (elementParameters.attributeSetter !== undefined) {
                    activeElement.autorun = autorun(() => {
                        if (elementParameters.attributeSetter) elementParameters.attributeSetter(element);
                    })
                }

                if (elementParameters.events) {
                    for (const event of elementParameters.events) {
                        element.addEventListener(event.name, event.handler, event.options);
                    }
                }

                if (elementParameters.components) {

                    let currentPoint: InsertPointProvider = () => {
                        return {
                            element,
                            position: "beforeend"
                        }
                    };

                    for (const component of elementParameters.components) {
                        const componentConfig = component(currentPoint);
                        context.components.push(componentConfig.component);
                        currentPoint = componentConfig.component.siblingInsertPoint;
                    }
                }
            }
        }
    }

    return {
        insertPoint: () => getSegmentInsertPoint(context),
        insert: (host?: ComponentInsertPosition | Element) => insertSegment(context, host),
        remove: () => removeSegment(context),
        dispose: () => disposeSegment(context)
    };

    function getSegmentInsertPoint(context: SegmentContext): ComponentInsertPosition {

        if (context.attached && context.attached) {
            if (context.elements.length > 0) {
                return {
                    element: context.elements[context.elements.length - 1],
                    position: "afterend"
                }
            }
        }
        return context.segmentInsertPoint();
    }
    function insertSegment(context: SegmentContext, insertPoint?: ComponentInsertPosition | Element) {
        if (context.disposed) return;

        let { element, position } = (getInsertPointProvider(insertPoint) ?? context.segmentInsertPoint)();


        if (element && context.elements.length > 0) {
            let inserted = element.insertAdjacentElement(position, context.elements[0]);
            if (inserted) {
                element = inserted;
                position = "afterend";

                for (let index = 1; index < context.elements.length; index++) {
                    const el = context.elements[index];
                    inserted = element.insertAdjacentElement(position, el);
                    if (inserted) {
                        element = inserted
                    }
                }
            }
        }

        for (const component of context.components) {
            component.insert();
        }
        context.attached = true;
    }
    function removeSegment(context: SegmentContext) {
        for (const el of context.elements) {
            el.remove();
        }
        for (const el of context.components) {
            el.remove();
        }
        context.attached = false;
    }
    function disposeSegment(context: SegmentContext) {

        removeSegment(context);
        context.elements.splice(0, context.elements.length - 1);

        for (const elementId in context.activeElements) {
            if (context.activeElements.hasOwnProperty(elementId)) {
                const element = context.activeElements[elementId];

                if (element.autorun) {
                    element.autorun();
                }

                if (element.events) {
                    for (const event of element.events) {
                        removeEventListener(event.name, event.handler);
                    }
                }
            }
        }

        context.disposed = true;
    }
}
interface SegmentParameters {
    segmentInsertPoint: InsertPointProvider,
    elements?: {
        [id: string]: ElementParameters
    },
    components?: Array<(insertPoint: InsertPointProvider) => ComponentConfig>,
    switchCondition?: () => any
}
interface ElementParameters {
    id: string,
    originalId: string,
    attributeSetter?: (element: Element) => void,
    textSetter?: (element: Element) => void,
    events?: EventContext[],
    components?: Array<(insertPoint: InsertPointProvider) => ComponentConfig>
}
interface SegmentContext {
    disposed: boolean;
    attached: boolean;
    readonly segmentInsertPoint: InsertPointProvider;
    readonly elements: Element[];
    readonly components: Component[];
    readonly activeElements: { [id: string]: ElementContext }
}


// #endregion

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


// #endregion helper methods