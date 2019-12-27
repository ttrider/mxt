import ts from "typescript";

export declare type TypeNodeArgument = null | undefined | string | ts.Identifier | ts.QualifiedName | ts.TypeNode;
export declare type TypeNodeBuilder = ts.TypeNode & {
    addType: (...type: Array<TypeNodeArgument>) => TypeNodeBuilder

};

export function TypeNode(...type: Array<TypeNodeArgument>): TypeNodeBuilder {

    let obj: TypeNodeBuilder = update(mergeTypes(undefined, type));

    return obj;

    function addType(...type: Array<TypeNodeArgument>) {

        return obj = update(mergeTypes(obj, type));
    }

    function update(newObj: any): TypeNodeBuilder {

        newObj.addType = addType;

        return newObj;
    }

    function mergeTypes(currentType: ts.TypeNode | undefined, type: Array<TypeNodeArgument>) {

        const t = type.reduce<ts.TypeNode[]>((ret, item) => {

            if (item === undefined) {
                item = "undefined";
            } else if (item === null) {
                item = "null";
            }
            if (typeof item === "string") {
                ret.push(ts.createTypeReferenceNode(item, undefined));
            } else if (ts.isTypeNode(item)) {

                if (ts.isUnionTypeNode(item)) {
                    ret.push(...item.types);
                } else {
                    ret.push(item);
                }
            }
            else {
                ret.push(ts.createTypeReferenceNode(item, undefined));
            }
            return ret;
        }, []);

        if (currentType !== undefined) {

            if (ts.isUnionTypeNode(currentType)) {
                t.push(...currentType.types);
            } else {
                t.push(currentType);
            }
        }

        if (t.length === 0) {
            return ts.createTypeReferenceNode("any", undefined);
        }
        if (t.length === 1) {
            return t[0];
        }
        return ts.createUnionTypeNode(t);
    }
}