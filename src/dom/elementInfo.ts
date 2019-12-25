import fs from "fs";

interface EventMap {
    name: string,
    extends: string[],
    events: {
        [name: string]: string
    };
}

interface ElementMap {
    name: string,
    extends: string[],
    eventMaps: string[];
}

const elementMaps: { [tag: string]: ElementMap } = {};

const tagMappings: { [tag: string]: string } = {};

const eventMaps: { [tag: string]: EventMap } = {};


const domSource = "./node_modules/typescript/lib/lib.dom.d.ts";

console.time();

const d = fs.readFileSync(domSource);
if (d) {
    const dom = d.toString();

    extractMaps(dom);
}

console.timeEnd();

function extractMaps(dom: string) {
    const regex = /interface\s+([\w]*?(TagNameMap|EventMap)?)\s(extends\s+((([\w]+)(,\s)?)+))?\s*\{(.*?)\}/gms;

    let m;

    while ((m = regex.exec(dom)) !== null) {
        // This is necessary to avoid infinite loops with zero-width matches
        if (m.index === regex.lastIndex) {
            regex.lastIndex++;
        }

        if (!m[2]) {

            const elementMapItem: ElementMap = {
                name: m[1],
                extends: m[4] ? m[4].split(",").map(item => item.trim()) : [],
                eventMaps: detectEventMaps(m[8]),
            };

            elementMaps[elementMapItem.name] = elementMapItem;

        } else if (m[2] === "EventMap") {

            const eventMapItem: EventMap = {
                name: m[1],
                extends: m[4] ? m[4].split(",").map(item => item.trim()) : [],
                events: processEventMap(m[8]),
            }

            eventMaps[eventMapItem.name] = eventMapItem;
            // event map
        } else if (m[2] === "TagNameMap") {
            processTagNameMap(m[8]);
        }
    }
}

function detectEventMaps(dom: string) {

    const ret: string[] = [];

    const regex = /addEventListener<K\s+extends\s+keyof\s+(\w+)>/gms;


    let m;

    while ((m = regex.exec(dom)) !== null) {
        // This is necessary to avoid infinite loops with zero-width matches
        if (m.index === regex.lastIndex) {
            regex.lastIndex++;
        }

        // The result can be accessed through the `m`-variable.
        ret.push(m[1]);
    }

    return ret;
}

function processTagNameMap(dom: string) {
    if (!dom) return;


    const regex = /"([\w]+)"\:\s+([\w]+);/gms;

    let m;

    while ((m = regex.exec(dom)) !== null) {
        // This is necessary to avoid infinite loops with zero-width matches
        if (m.index === regex.lastIndex) {
            regex.lastIndex++;
        }

        // The result can be accessed through the `m`-variable.
        if (!tagMappings[m[1]]) {
            tagMappings[m[1]] = m[2];
        }
    }
}

function processEventMap(dom: string) {
    const ret: { [tag: string]: string } = {

    }

    const regex = /"([\w]+)"\:\s+([\w]+);/gms;

    let m;

    while ((m = regex.exec(dom)) !== null) {
        // This is necessary to avoid infinite loops with zero-width matches
        if (m.index === regex.lastIndex) {
            regex.lastIndex++;
        }

        // The result can be accessed through the `m`-variable.
        ret[m[1]] = m[2];
    }

    return ret;
}

export default function getElementInfo(elementTag: string) {
    if (!elementTag) return;

    elementTag = elementTag.toLowerCase();

    const maps: { [name: string]: unknown } = {};
    const events: { [name: string]: string } = {};

    const elementName = tagMappings[elementTag];
    if (elementName) {

        collectEventMaps(elementName);

        for (const mapName of Object.keys(maps)) {
            collectEvents(mapName);
        }
    }


    return {
        events
    };

    function collectEventMaps(name: string) {

        const elementMap = elementMaps[name];
        if (elementMap) {
            for (const map of elementMap.eventMaps) {
                maps[map] = null;
            }

            for (const parent of elementMap.extends) {
                collectEventMaps(parent);
            }
        }
    }

    function collectEvents(name: string) {

        const map = eventMaps[name];

        if (map) {
            for (const key in map.events) {
                if (map.events.hasOwnProperty(key)) {
                    const event = map.events[key];

                    if (events[key] && events[key] !== event) {
                        // duplicate event names -> reseting type to Event
                        events[key] = "Event";
                    } else {
                        events[key] = event;
                    }
                }
            }
            for (const parent of map.extends) {
                collectEvents(parent);
            }
        }
    }
}