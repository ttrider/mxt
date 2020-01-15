import DataContext from "./data-context";
import Context from "./context";


export interface ComponentInsertPosition {
    element: Element | undefined | null,
    position: InsertPosition
};

export declare type InsertPointProvider = () => ComponentInsertPosition;

export declare type PartFactory = (dc: DataContext, ipp: InsertPointProvider) => Context;

export declare type CreateParams =
    (
        TemplateParams |
        PartsParams |
        LoopParams
    );

export interface CommonParams {
    styles?: Array<(dc: DataContext) => string>,
    cid?: string;
}

export interface TemplateParams extends CommonParams {
    template: HTMLTemplateElement | string;
    attachTo?: AttachParams[];
    embed?: { [id: string]: PartFactory }
}

export interface AttachParams {
    id: string,
    originalId?: string,
    attrs?: (dc: DataContext) => { [name: string]: any },
    value?: (dc: DataContext) => any,
    events?: EventParams[]
}

export interface EventParams {
    name: string,
    handler: (ev: Event, dc: DataContext) => void,
    flags?: number
}

export interface PartsParams extends CommonParams {
    switch?: (dc: DataContext) => any,
    sequence: Array<PartFactory | PartParams>
}

export interface PartParams {
    dc?: DataContext | ((dc: DataContext) => DataContext),
    part: PartFactory,
    when?: (($on: any, dc: DataContext) => boolean) | "default",
    order?: number
}


export interface LoopParams extends CommonParams {
    forEach: (dc: DataContext) => any,
    part: PartFactory
}

export interface Part {
    insert: () => void;
    remove: () => void;
    dispose: () => void;
}

export interface ConditionalPart {
    part: Part,
    when: ($on: any, da: DataContext) => boolean,
    order: number
};

export interface Component {

    insert: (host?: Element | ComponentInsertPosition | undefined | null) => void;
    remove: () => void;
    dispose: () => void;
};