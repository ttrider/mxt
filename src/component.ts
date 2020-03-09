import { TokenizedContent, TemplateInfo } from ".";
import { Part, PartReference } from "./template-parts";

export class Component {

    static partIndex: number = 0;
    static newPartId() {
        return `p${Component.partIndex++}`;
    }


    dynamicStyles?: TokenizedContent[];
    styles?: TokenizedContent[];
    id: string;
    rootPart?: PartReference;
    parts: { [id: string]: TemplateInfo } = {};

    importParts: { [id: string]: string } = {};

    partset: { [id: string]: Part } = {};

    constructor(id: string) {
        this.id = id;
    }

    addComponentImport(name: string) {
        if (this.importParts[name]) {
            return this.importParts[name];
        }
        return this.importParts[name] = Component.newPartId();
    }

    newPart<T>(init?: T, id?: string): Part & T {
        if (!id) {
            id = Component.newPartId();
        }

        const part = (init) ? {
            id,
            ...init
        } as Part & T : { id } as Part & T;

        this.partset[id] = part;

        return part;
    }

}