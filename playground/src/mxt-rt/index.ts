import { CreateParams, TemplateParams, PartsParams, LoopParams, ComponentInsertPosition, InsertPointProvider, PartFactory } from "./types";
import DataContext from "./data-context";
import Context from "./context";
import TemplateContext from "./template-context";
import PartsContext from "./parts-context";
import LoopContext from "./loop-context";
import StylesContext from "./styles-context";

interface Component {

    insert: (host?: Element | ComponentInsertPosition | undefined | null) => void;
    remove: () => void;
    dispose: () => void;
};

interface Config {
    exports: {
        [name: string]: {
            part: string,
            styles?: ($cid: string) => string[]
        } | string
    },
    parts: { [name: string]: (($pf: { [name: string]: PartFactory }) => CreateParams) | string },
    imports?: { [name: string]: (data: any, host?: Element | InsertPointProvider | null | undefined) => Component },
    globals?: {
        styles?: string[]
    }
}

function register(regParams: Config) {
    const { exports, parts, imports, globals } = regParams;

    if (globals) {
        if (globals.styles) {
            for (const gs of globals.styles) {
                const se = document.createElement("style");
                se.innerText = gs;
                document.head.appendChild(se);
            }
        }
    }

    const pf: { [name: string]: PartFactory } = {};
    const params: { [name: string]: CreateParams } = {};
    const cStyles: { [name: string]: Array<($cid: string) => string[]> } = {};

    if (imports) {
        for (const importKey in imports) {
            if (imports.hasOwnProperty(importKey)) {
                const importItem = imports[importKey] as any;
                if (importItem.component) {
                    pf[importKey] = importItem.component;
                }
            }
        }
    }

    for (const pfKey in parts) {
        if (parts.hasOwnProperty(pfKey)) {
            const partParams = parts[pfKey];

            pf[pfKey] = ((dc: DataContext, ipp: InsertPointProvider) => {

                if (params[pfKey] === undefined) {
                    params[pfKey] = (typeof partParams === "string")
                        ? { template: partParams }
                        : partParams(pf);

                    const cid = params[pfKey].cid = getId("mxt-pfKey-");

                    const cs = cStyles[pfKey];
                    if (cs !== undefined) {


                        const styleText = cs.reduce<string[]>((ss, item) => {
                            ss.push(...item(cid));
                            return ss;
                        }, []).join(" ");
                        if (styleText) {
                            const se = document.createElement("style");
                            se.innerText = styleText;
                            document.head.appendChild(se);
                        }
                    }
                }
                const cp = params[pfKey];

                if (isTemplateParams(cp)) {
                    return new TemplateContext(cp, dc, ipp);
                }
                if (isPartsParams(cp)) {
                    return new PartsContext(cp, dc, ipp);
                }
                if (isLoopParams(cp)) {
                    return new LoopContext(cp, dc, ipp);
                }
                return new StylesContext(cp, dc, ipp);
            });


        }
    }

    const exp: {
        [name: string]: (data: any, host?: null | undefined | Element | InsertPointProvider) => Component
    } = {};

    for (const name in exports) {
        if (exports.hasOwnProperty(name)) {

            let ef = exports[name];

            const exportInfo = (typeof ef === "string")
                ? {
                    part: ef,
                }
                : ef;

            exp[name] = (data, host) => {
                return createComponent(data, host, pf[exportInfo.part]);
            }
            (exp[name] as any).component = pf[exportInfo.part];

            if (exportInfo.styles) {
                if (cStyles[exportInfo.part] === undefined) {
                    cStyles[exportInfo.part] = [exportInfo.styles];
                } else {
                    cStyles[exportInfo.part].push(exportInfo.styles);
                }
            }
        }
    }

    return exp;
}

function createComponent(
    data: any | DataContext,
    host: null | undefined | Element | InsertPointProvider,
    componentFactory: (dataContext: DataContext, segmentInsertPoint: InsertPointProvider) => Context
): Component {

    if (data === undefined) throw new Error("data parameter is undefined");

    const dc = DataContext.isDC(data) ? data : new DataContext(getId("mxt-iid-"), data);

    // if data is DataContext and host is InsertPointProvider, then we use it as a tempplate subcomponent
    // otherwise as a top level component
    if (DataContext.isDC(data) && host !== undefined && typeof host === "function") {
        return componentFactory(dc, host);
    }

    const ipp = (host !== undefined && typeof host === "function") ? host : () => { return { element: host, position: "beforeend" as InsertPosition } };

    const context = componentFactory(dc, ipp);

    const component = {
        insert: (insertPoint?: Element | ComponentInsertPosition | undefined | null) => {

            context.updateHead(insertPoint);
            context.insert();
        },
        remove: () => context.remove(),
        dispose: () => context.dispose()
    };


    if (host) {
        component.insert();
    }

    return component;
}


function isTemplateParams(params: CreateParams): params is TemplateParams {
    return (params as any).template !== undefined;
}
function isPartsParams(params: CreateParams): params is PartsParams {
    return (params as any).sequence !== undefined;
}
function isLoopParams(params: CreateParams): params is LoopParams {
    return (params as any).forEach !== undefined;
}

let lastId = 0;
function getId(prefix: string = "") {

    let id = (new Date()).valueOf();
    while (id === lastId) {
        id++;
    }
    lastId = id;

    return prefix + toId(id);

    function toId(val: number) {
        const chars: number[] = [];

        while (val > 0) {
            chars.push(val % 62);
            val = Math.floor(val / 62);
        }
        return String.fromCharCode(...chars.map(i => {
            if (i < 10) {
                return i + 48;
            }
            i -= 10;
            if (i < 26) {
                return i + 65;
            }
            i -= 26;
            return i + 97;
        }));
    }
}


export default register;