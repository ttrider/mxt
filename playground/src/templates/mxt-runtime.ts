import { IReactionDisposer, autorun } from "mobx";

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


function isInsertPoint(item: ComponentInsertPosition | Element): item is ComponentInsertPosition {
    return ((item as any).nodeName === undefined);
}
function getInsertPointProvider(insertPoint?: InsertPointProvider | ComponentInsertPosition | Element) {

    if (insertPoint === undefined) return undefined;

    if (typeof insertPoint === "function") {
        return insertPoint;
    }

    if (isInsertPoint(insertPoint)) {
        return () => insertPoint;
    }

    return () => { return { element: insertPoint, position: "beforeend" } as ComponentInsertPosition }
}

// #region container

export function createContainer(
    parentContext: ContainerContext | undefined,
    parentInsertPoint: InsertPointProvider,
    segments: Array<(insertPoint: InsertPointProvider, parentContext?: ContainerContext) => Component>,
    unconditionalInsert: (segments: Component[]) => void,
    conditionalInsert: (segments: Component[]) => void) {

    const context: ContainerContext = {
        parentContext,
        unconditionalInsert,
        conditionalInsert,
        containerInsertPoint: parentInsertPoint,
        segments: [],
        disposed: false,
        attached: false,
    }

    let currentPoint = parentInsertPoint;

    for (const segment of segments) {

        const newSegment = segment(currentPoint, context);

        context.segments.push(newSegment);
        currentPoint = newSegment.insertPoint;
    }


    return {
        insertPoint: () => getContainerInsertPoint(context),
        insert: (insertPosition?: ComponentInsertPosition | Element) => insertComponent(insertPosition),
        remove: () => removeContainer(context),
        dispose: () => disposeContainer(context)
    };

    function getContainerInsertPoint(context: ContainerContext): ComponentInsertPosition {

        if (context.segments.length > 0) {
            context.segments[context.segments.length - 1].insertPoint();
        }
        return context.containerInsertPoint();
    }

    function insertComponent(insertPosition?: ComponentInsertPosition | Element) {
        context.attached = true;

        const provider = getInsertPointProvider(insertPosition);
        if (provider) {
            context.containerInsertPoint = provider;
        }

        if (context.unconditionalInsert) {
            context.unconditionalInsert(context.segments);
        }

        if (context.conditionalInsert) {
            context.autorun = autorun(() => {
                context.conditionalInsert(context.segments);
            });
        }

    }

    function removeContainer(context: ContainerContext) {
        if (context.autorun) {
            context.autorun();
        }
        for (const segment of context.segments) {
            segment.remove();
        }
        context.attached = false;
    }

    function disposeContainer(context: ContainerContext) {
        removeContainer(context);

        context.segments.splice(0, context.segments.length - 1);

        context.disposed = true;
    }
}


export interface ContainerContext {
    parentContext?: ContainerContext,
    unconditionalInsert?: (segments: Component[]) => void,
    conditionalInsert: (segments: Component[]) => void,
    autorun?: IReactionDisposer,
    containerInsertPoint: InsertPointProvider,
    segments: Component[],
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

    let child = template.content.firstElementChild;
    while (child) {
        context.elements.push(child);
        child = child.nextElementSibling;
    }

    const elements = parameters.elements;

    for (const elementId in elements) {
        if (elements.hasOwnProperty(elementId)) {
            const elementParameters = elements[elementId];
            const element = template.content.getElementById(elementId);
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