import { Context, InsertPointProvider, DataContext, CommonParams } from ".";

export class StylesContext extends Context {

    constructor(params: CommonParams, dc: DataContext, ipp: InsertPointProvider) {
        super(params, dc, ipp);
    }
}