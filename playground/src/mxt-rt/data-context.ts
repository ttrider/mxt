import { observable } from "mobx";


export class DataContext {
    $root: any;
    $data: any;
    $iid: string;
    $parent?: DataContext;
    $collection?: any;
    // @observable $key?: any;
    // @observable $index?: number;
    $key?: any;
    $index?: number;

    constructor(iid: string, data: any, parent?: DataContext) {
        this.$iid = iid;
        this.$root = parent !== undefined ? parent.$root : data;
        this.$data = data;
        this.$parent = parent;
    }

    create(data: any) {
        return new DataContext(this.$iid, data, this);
    }
    createIteration(data: any, collection: any, index: number, key?: any) {
        const dc = new DataContext(this.$iid, data, this);
        dc.$collection = collection;

        observable(this, "$index");
        observable(this, "$key");

        dc.$index = index;
        dc.$key = key ?? index.toString();
        return dc;
    }

    static isDC(data: any): data is DataContext {
        return data instanceof DataContext;
    }
}

export default DataContext;