import ts from "typescript";
import { TypeNodeArgument,TypeNode } from "./type";

interface ParameterDeclarationBuilder extends ts.ParameterDeclaration {
    setType: (...types: Array<TypeNodeArgument>) => ParameterDeclarationBuilder;

    readonly optional: ParameterDeclarationBuilder;
    readonly dotDotDot: ParameterDeclarationBuilder;
}
export function Parameter(name: string, ...types: Array<TypeNodeArgument>) {

    let obj = ts.createParameter(
        undefined,
        undefined,
        undefined,
        name,
        undefined,
        types.length > 0 ? TypeNode(...types) : undefined);

    return update(obj);

    function update(newObj: any): ParameterDeclarationBuilder {

        newObj.setType = setType;

        Object.defineProperty(
            newObj,
            "optional",
            {
                get() {
                    return obj = update(ts.updateParameter(obj, obj.decorators, obj.modifiers, obj.dotDotDotToken, obj.name, ts.createToken(ts.SyntaxKind.QuestionToken), obj.type === undefined ? TypeNode() : obj.type, obj.initializer));
                }
            }
        );
        Object.defineProperty(
            newObj,
            "dotDotDot",
            {
                get() {
                    return obj = update(ts.updateParameter(obj, obj.decorators, obj.modifiers, ts.createToken(ts.SyntaxKind.DotDotDotToken), obj.name, obj.questionToken, obj.type, obj.initializer));
                }
            }
        );

        return newObj;
    }

    function setType(...types: Array<TypeNodeArgument>) {
        return obj = update(ts.updateParameter(obj, obj.decorators, obj.modifiers, obj.dotDotDotToken, obj.name, obj.questionToken, TypeNode(...types), obj.initializer));
    }
}