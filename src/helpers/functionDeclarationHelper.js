const { types: t } = require("@babel/core");
const { removeThisExpression } = require("./removeThisHelper");

const buildFunctionFromClassDeclaration = classDeclarationPath => {
  const functionBody = iterateClassDeclarationBody(classDeclarationPath);
  return t.functionDeclaration(
    t.identifier(classDeclarationPath.node.id.name),
    [t.identifier("props")],
    t.blockStatement(functionBody)
  );
};

const iterateClassDeclarationBody = classDeclarationPath => {
  const classBody = classDeclarationPath.get("body");
  const body = classBody.get("body");
  if (Array.isArray(body)) {
    return body.map(x => transformClassBodyMembers(x));
  }
  return [];
};

/**
 * Switch between different types of nodes and return the transformed node
 * @param {*} path
 */
const transformClassBodyMembers = path => {
  if (t.isClassProperty(path)) return classPropertyToVariableDeclaration(path);
  if (t.isClassMethod(path)) return switchClassMethods(path);
  return t.blockStatement([]);
};

const classPropertyToVariableDeclaration = path => {
  const name = path.get("key").get("name").node;

  return t.variableDeclaration("const", [
    t.variableDeclarator(t.identifier(name), path.get("value").node)
  ]);
};

/**
 * Switch between different class method names and return the appropriate type
 * @param {*} path
 */
const switchClassMethods = path => {
  const name = path.get("key").get("name").node;
  switch (name) {
    case "render":
      return renderMethodToReturnStatement(path);
    case "componentDidMount":
      return componentDidMountToUseEffect(path);
    default:
      return null;
  }
};

const renderMethodToReturnStatement = classMethodPath => {
  const classMethodBody = classMethodPath.get("body");
  const returnStatementPath = classMethodBody
    .get("body")
    .find(x => t.isReturnStatement(x));
  return removeThisExpression(returnStatementPath).node;
};

const componentDidMountToUseEffect = classMethodPath => {
  return null;
};

exports.buildFunctionFromClassDeclaration = buildFunctionFromClassDeclaration;
