import { TokenizedContent, TemplateInfo } from ".";
import { Part } from "./template_parts";

export class Component {

    static partIndex: number = 0;
    static newPartId() {
        return `p${Component.partIndex++}`;
    }


    dynamicStyles?: TokenizedContent[];
    styles?: TokenizedContent[];
    id: string;
    rootPart?: string;
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

    newPart<T>(init?: T): Part & T {
        const id = Component.newPartId();

        const part = (init) ? {
            id,
            ...init
        } as Part & T : { id } as Part & T;

        this.partset[id] = part;

        return part;
    }

}