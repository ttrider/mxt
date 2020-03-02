import { ExpressionInfo } from ".";

/**
 * Part definition
 */
export interface Part {
    id: string;
}

export const EmptyPart: Part = { id: "" };



/**
 * Sequence definition
 */
export interface Sequence<T extends PartReference> {
    sequence: T[];
}

/**
 * Switch Sequence Part definition
 */
export interface SwitchSequence extends Sequence<WhenPartReference> {
    switch?: ExpressionInfo;
}

/**
 * Sequence Part definition
 */
export interface Template {
    elements: Element[];
    attachTo?: AttachTemplate[];
}

export interface ForEach {
    forEach?: ExpressionInfo;
    part: Part;
}

export interface AttachTemplate {
    id: string;
    embed?: string;
    attrs?: {
        [name: string]: ExpressionInfo
    };
    value?: ExpressionInfo;
    events?: Array<{
        name: string;
        handler: ExpressionInfo;
        preventDefault?: boolean;
        stopPropagation?: boolean;
        stopImmediatePropagation?: boolean;
        once?: boolean;
        passive?: boolean;
        capture?: boolean;
    }>;

}

/**
 * Component Part definition
 */
export interface ComponentRef {
    componentId: string;
}

/**
 * Part reference
 */
export interface PartReference {
    partId?: string,
    dc?: ExpressionInfo
}

/**
 * Part reference
 */
export interface WhenPartReference extends PartReference {
    when?: ExpressionInfo
}


export declare type SwitchSequencePart = SwitchSequence & Part;
export declare type TemplatePart = Template & Part;
export declare type ForEachPart = ForEach & Part;
export declare type ComponentRefPart = ComponentRef & Part;

/**
 * Sequence Part definition
 */
export interface SequencePart<T extends PartReference> extends Sequence<T>, Part {
}
