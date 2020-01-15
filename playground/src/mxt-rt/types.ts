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
        LoopParams |
        StylesParams
    );

export interface CommonParams {

    cid?: string;
}

export interface TemplateParams extends CommonParams {
    template: HTMLTemplateElement | string;
    attachTo?: AttachParams[];
}

export interface AttachParams {
    id: string,
    originalId?: string,
    attrs?: (dc: DataContext) => { [name: string]: any },
    value?: (dc: DataContext) => any,
    events?: EventParams[],
    embed?: PartFactory,
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

export interface StylesParams extends CommonParams {
    styles?: Array<(dc: DataContext) => string>,
}