import { IReactionDisposer, autorun } from "mobx";

export declare type SegmentInsertPoint = {
    element: Element | undefined | null,
    position: InsertPosition
};

export declare type SegmentInsertPointProvider = () => SegmentInsertPoint;

export declare type SegmentComponent = {

    insertPoint: () => SegmentInsertPoint;
    insert: (host?: SegmentInsertPoint | undefined) => void;
    remove: () => void;
    dispose: () => void;
};

export interface SegmentParameters {
    segmentInsertPoint: SegmentInsertPointProvider,
    elements: {
        [id: string]: ElementParameters
    }

}

export interface ElementParameters {
    id: string,
    originalId: string,

    attributeSetter?: (element: Element) => void,

    events: EventContext[]
}


export interface SegmentContext {

    visible: boolean;
    disposed: boolean;
    attached: boolean;

    readonly segmentInsertPoint: SegmentInsertPointProvider;

    readonly elements: Element[];

    readonly activeElements: { [id: string]: ElementContext }
}


export interface ElementContext {

    element: Element;
    autorun?: IReactionDisposer;
    events: EventContext[];
}

export interface EventContext {

    name: string,
    handler: (ev: Event) => void,
    options?: AddEventListenerOptions

}

export interface SegmentContainer {
    containerInsertPoint: SegmentInsertPointProvider,
    segments: SegmentComponent[],
    visible: boolean,
    disposed: boolean,
    attached: boolean,
}

export function initializeSegmentContainer(
    parentInsertPoint: SegmentInsertPointProvider,
    ...segments: Array<(insertPoint: SegmentInsertPointProvider) => SegmentComponent>) {

    const container: SegmentContainer = {
        containerInsertPoint: parentInsertPoint,
        segments: [],
        visible: true,
        disposed: false,
        attached: false,
    }

    let currentPoint = parentInsertPoint;

    for (const segment of segments) {

        const newSegment = segment(currentPoint);

        container.segments.push(newSegment);
        currentPoint = newSegment.insertPoint;
    }

    return container;
}

export function initializeSegmentContext(template: HTMLTemplateElement, parameters: SegmentParameters) {

    const context: SegmentContext = {
        segmentInsertPoint: parameters.segmentInsertPoint,
        visible: true,
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

    return context;
}

export function getSegmentInsertPoint(context: SegmentContext): SegmentInsertPoint {

    if (context.attached && context.visible) {
        if (context.elements.length > 0) {
            return {
                element: context.elements[context.elements.length - 1],
                position: "afterend"
            }
        }
    }
    return context.segmentInsertPoint();
}


export function insertSegment(context: SegmentContext, insertPoint?: SegmentInsertPoint) {
    if (context.disposed) return;

    let { element, position } = insertPoint ?? context.segmentInsertPoint();


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

export function removeSegment(context: SegmentContext) {
    for (const el of context.elements) {
        el.remove();
    }
    context.attached = false;
}

export function getContainerInsertPoint(context: SegmentContainer): SegmentInsertPoint {

    if (context.segments.length > 0) {
        context.segments[context.segments.length - 1].insertPoint();
    }
    return context.containerInsertPoint();

}

export function removeContainer(context: SegmentContainer) {
    for (const segment of context.segments) {
        segment.remove();
    }
}

export function disposeContainer(context: SegmentContainer) {
    removeContainer(context);
}

export function updateContainerInsertPoint(context: SegmentContainer, ip?: SegmentInsertPoint) {
    if (ip) {
        context.containerInsertPoint = () => ip;
    }
}

export function disposeSegment(context: SegmentContext) {

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