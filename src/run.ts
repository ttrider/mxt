import mxt from "./index";


// import less from "less";

// const ls =
//     `
// @import "t.less";
// @foo: 123;
// @bar: 245;
// @foobar: @foo+@bar;
// .d{
//     margin: @foobar;
//     .c {
//     padding: ___123456789___
//     }
// }
// `

// less.render(ls,
//     {
//         compress: false,
//         globalVars: {
//             something: "something"

//         },
//         modifyVars: {
//             foo: "1"

//         }
//     },
//     (error: Less.RenderError, output: Less.RenderOutput | undefined) => {

//         if (error) {
//             console.info(JSON.stringify(error, null, 4));
//         }

//         if (output) {
//             console.info(output.css);
//         }

//     });




mxt({ input: "playground/src/templates/*.html" }).then(() => console.info("Done")).catch(err => console.error(err));