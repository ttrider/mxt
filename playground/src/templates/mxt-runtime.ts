import { IReactionDisposer, autorun } from "mobx";


export interface DataContext {

    $data: any,
    $root: any,
    $parent?: DataContext,

    $collection?: any,
    $key?: any,
    $item?: any,
    $index?: number,

}

export declare type ComponentInsertPosition = {
    element: Element | undefined | null,
    position: InsertPosition
};

export declare type InsertPointProvider = () => ComponentInsertPosition;

export declare type Component = {

    insertPoint: () => ComponentInsertPosition;
    insert: (host?: ComponentInsertPosition | undefined) => void;
    remove: () => void;
    dispose: () => void;
};


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

// #region container

export function createContainer(
    parentContext: ContainerContext | undefined,
    parentInsertPoint: InsertPointProvider,
    components: Array<(insertPoint: InsertPointProvider, parentContext?: ContainerContext) => ComponentConfig>,
    switchCondition?: () => any) {

    const context: ContainerContext = {
        parentContext,
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
        currentPoint = componentConfig.component.insertPoint;
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
            return context.lastComponent.insertPoint();
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
    parentContext?: ContainerContext,
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

                for (const event of elementParameters.events) {
                    element.addEventListener(event.name, event.handler, event.options);
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
        context.attached = true;
    }
    function removeSegment(context: SegmentContext) {
        for (const el of context.elements) {
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

                for (const event of element.events) {
                    removeEventListener(event.name, event.handler);
                }
            }
        }

        context.disposed = true;
    }
}
interface SegmentParameters {
    segmentInsertPoint: InsertPointProvider,
    elements: {
        [id: string]: ElementParameters
    }
}
interface ElementParameters {
    id: string,
    originalId: string,
    attributeSetter?: (element: Element) => void,
    events: EventContext[]
}
interface SegmentContext {
    disposed: boolean;
    attached: boolean;
    readonly segmentInsertPoint: InsertPointProvider;
    readonly elements: Element[];
    readonly activeElements: { [id: string]: ElementContext }
}
interface ElementContext {
    element: Element;
    autorun?: IReactionDisposer;
    events: EventContext[];
}
interface EventContext {
    name: string,
    handler: (ev: Event) => void,
    options?: AddEventListenerOptions
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

export function createDataContext(data: any | DataContext, params?: { parent: DataContext }): DataContext {

    if (data.$root !== undefined && data.$data !== undefined) {
        return data;
    }

    if (params) {
        const { parent } = params;

        const context: DataContext = {
            $root: parent.$root,
            $data: data,
            $parent: parent
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