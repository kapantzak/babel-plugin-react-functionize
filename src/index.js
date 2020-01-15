const { declare } = require("@babel/helper-plugin-utils");
const { classExtendsReact } = require("./helpers/classExtendsReact");
const {
  buildFunctionFromClassDeclaration
} = require("./helpers/functionDeclarationHelper");

module.exports = declare(api => {
  api.assertVersion(7);

  return {
    name: "react-functionize",
    visitor: {
      ClassDeclaration(path) {
        if (classExtendsReact(path.node)) {
          path.replaceWith(buildFunctionFromClassDeclaration(path));
        }
      }
    }
  };
});
