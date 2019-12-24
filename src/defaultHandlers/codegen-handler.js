"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const typescript_1 = __importDefault(require("typescript"));
const builder_1 = require("../ts/builder");
function codegen(context, componentFile) {
    componentFile.addImport("autorun", "mobx");
    // create definitions code
    for (const templateId in componentFile.templates) {
        if (componentFile.templates.hasOwnProperty(templateId)) {
            const template = componentFile.templates[templateId];
            const constTemplateName = `${template.id}$$template`;
            const templateLiteral = builder_1.makeTemplateLiteral(template.elements);
            componentFile.initStatements.add(builder_1.declareVar(constTemplateName)
                .const
                .init(builder_1.makeCall("document.createElement", "template")), typescript_1.default.createStatement(builder_1.makeAssignment(constTemplateName + ".innerHTML", templateLiteral)));
        }
    }
    // create init function code
    for (const templateId in componentFile.templates) {
        if (componentFile.templates.hasOwnProperty(templateId)) {
            const template = componentFile.templates[templateId];
            const constTemplateName = `${template.id}$$template`;
            const funcBody = builder_1.statements().add(builder_1.declareVar("component")
                .const
                .init(builder_1.makeCall("document.importNode", typescript_1.default.createIdentifier(constTemplateName), true)));
            const elements = template.tokens.reduce((p, v) => {
                if (p[v.elementId] === undefined) {
                    p[v.elementId] = [v];
                }
                else {
                    p[v.elementId].push(v);
                }
                return p;
            }, {});
            for (const elementId in elements) {
                if (elements.hasOwnProperty(elementId)) {
                    const tokenSet = elements[elementId];
                    const elementOriginalId = tokenSet[0].elementIdOriginal;
                    const elementName = `${elementId}$$element`;
                    const externalReferences = Object.keys(tokenSet.reduce((e, i) => {
                        for (const er of i.externalReferences) {
                            e[er] = null;
                        }
                        return e;
                    }, {})).map(er => { return { name: er }; });
                    funcBody
                        .add(builder_1.declareVar(elementName)
                        .const
                        .init(builder_1.makeCall("component.content.getElementById", elementId).build())
                        .build())
                        .add(typescript_1.default.createIf(typescript_1.default.createPrefix(typescript_1.default.SyntaxKind.ExclamationToken, typescript_1.default.createIdentifier(elementName)), builder_1.makeThrow(`missing element: @${elementId}`)))
                        .add(typescript_1.default.createStatement(builder_1.makeAssignment(`${elementName}.id`, elementOriginalId)))
                        .add(builder_1.makeCall("autorun", builder_1.declareFunction()
                        .body(builder_1.declareObjectDestruction(...externalReferences).const.init(typescript_1.default.createIdentifier("data")))
                        .body(...tokenSet.map(token => builder_1.makeCall(elementName + ".setAttribute", token.attributeName, builder_1.makeTemplateLiteral(token.content)).build()))
                        .build()).build());
                }
            }
            funcBody.add(typescript_1.default.createIf(typescript_1.default.createIdentifier("host"), typescript_1.default.createStatement(builder_1.makeCall("host.appendChild", typescript_1.default.createIdentifier("component.content")).build())))
                .add(typescript_1.default.createReturn(typescript_1.default.createIdentifier("component.content")));
            componentFile.componentStatements.add(builder_1.declareFunction(template.id)
                .param("data")
                .param("host", null, undefined, "Element")
                .body(funcBody.build())
                .export
                .build());
        }
    }
    return true;
}
exports.codegen = codegen;
//# sourceMappingURL=codegen-handler.js.map