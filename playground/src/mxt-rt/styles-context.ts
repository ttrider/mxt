import * as rt from "./types";
import Context from "./context";
import DataContext from "./data-context";

export class StylesContext extends Context {

    constructor(params: rt.CommonParams, dc: DataContext, ipp: rt.InsertPointProvider) {
        super(params, dc, ipp);
    }
}