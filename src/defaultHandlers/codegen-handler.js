"use strict";
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (Object.hasOwnProperty.call(mod, k)) result[k] = mod[k];
    result["default"] = mod;
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
const types_1 = require("@babel/types");
const t = __importStar(require("@babel/types"));
const builder_1 = require("../ast/builder");
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
                .init(builder_1.makeCall("document.createElement", "template").build())
                .build(), builder_1.makeAssignment(constTemplateName + ".innerHTML", templateLiteral));
        }
    }
    // create init function code
    for (const templateId in componentFile.templates) {
        if (componentFile.templates.hasOwnProperty(templateId)) {
            const template = componentFile.templates[templateId];
            const constTemplateName = `${template.id}$$template`;
            const funcBody = builder_1.statementList().add(builder_1.declareVar("component")
                .const
                .init(builder_1.makeCall("document.importNode", t.identifier(constTemplateName), true).build())
                .build());
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
                        .add(types_1.ifStatement(types_1.unaryExpression("!", types_1.identifier(elementName)), builder_1.makeThrow(`missing element: @${elementId}`)))
                        .add(builder_1.makeAssignment(`${elementName}.id`, elementOriginalId))
                        .add(builder_1.makeCall("autorun", builder_1.declareFunction()
                        .body(builder_1.declareObjectDestruction(...externalReferences).const.init(types_1.identifier("data")).build())
                        .body(...tokenSet.map(token => builder_1.makeCall(elementName + ".setAttribute", token.attributeName, builder_1.makeTemplateLiteral(token.content)).build()))
                        .build()).build());
                }
            }
            funcBody.add(types_1.ifStatement(types_1.identifier("host"), types_1.expressionStatement(types_1.callExpression(types_1.identifier("host.appendChild"), [types_1.identifier("component.content")]))))
                .add(types_1.returnStatement(types_1.identifier("component.content")));
            componentFile.componentStatements.add(builder_1.declareFunction(template.id)
                .param("data")
                .param("host", null, undefined, "Element")
                .body(funcBody)
                .export
                .build());
        }
    }
    return true;
}
exports.codegen = codegen;
//# sourceMappingURL=codegen-handler.js.map