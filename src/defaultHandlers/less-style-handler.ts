import less from "less";
export async function processStyle(content: string) {
    const output = await less.render(content);
    return output.css;
}
export default processStyle;