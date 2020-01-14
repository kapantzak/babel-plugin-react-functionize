const { types: t } = require("@babel/core");

const buildFunctionFromClassDeclaration = classDeclaration => {
  return t.functionDeclaration(
    t.identifier(classDeclaration.id.name),
    [t.identifier("props")],
    t.blockStatement([])
  );
};

exports.buildFunctionFromClassDeclaration = buildFunctionFromClassDeclaration;
