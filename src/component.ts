import { TokenizedContent, TemplateInfo, Part } from ".";

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

    constructor(id: string) {
        this.id = id;
    }

    addComponentImport(name: string) {
        if (this.importParts[name]) {
            return this.importParts[name];
        }
        return this.importParts[name] = Component.newPartId();
    }

    newPart<T extends Part>(init?: T & { id?: string }) {
        const id = Component.newPartId();

        const part = {
            id
        } as T;

        //parts[id] = part;
        return part;
    }

}