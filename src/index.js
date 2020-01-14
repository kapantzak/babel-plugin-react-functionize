const { declare } = require("@babel/helper-plugin-utils");
const { types: t } = require("@babel/core");

module.exports = declare(api => {
  api.assertVersion(7);

  return {
    name: "react-functionize",
    visitor: {
      ClassDeclaration(path) {
        path.remove();
      }
    }
  };
});
