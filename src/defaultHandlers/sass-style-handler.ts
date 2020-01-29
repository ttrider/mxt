import sass from "sass";
export async function processStyle(content: string, type: "sass" | "scss") {

    const output = sass.renderSync({
        data: content,
        indentedSyntax: type === "sass",
    })

    return output.css.toString();
}
export default processStyle;