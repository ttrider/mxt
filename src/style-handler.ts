import { HandlerContext } from "./index";

function defaultStyleHandler(context: HandlerContext) {
    if (context.element.name !== "style") {
        return false;
    }

    // if (context.template === undefined){
    //     // global mode
    // }
    
    

    return true;
}

export default defaultStyleHandler;