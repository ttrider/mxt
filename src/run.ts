import mxt from "./index";


mxt({ input: "playground/src/templates/*.html" }).then(() => console.info("Done")).catch(err => console.error(err));