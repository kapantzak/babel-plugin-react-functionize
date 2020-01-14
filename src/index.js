const { declare } = require("@babel/helper-plugin-utils");
const { classExtendsReact } = require("./helpers/classExtendsReact");

module.exports = declare(api => {
  api.assertVersion(7);

  return {
    name: "react-functionize",
    visitor: {
      ClassDeclaration(path) {
        if (classExtendsReact(path.node)) {
          console.log(true);
        }
      }
    }
  };
});
