const { types: t } = require("@babel/core");
const { default: traverse } = require("@babel/traverse");
const {
  exportStateOutOfConstructor,
  exportStateSettersOutOfPath,
  generateStateHooksFromClassProperty
} = require("./stateHooksHelper");
const { removeThisExpression } = require("./removeThisHelper");

const buildFunctionFromClassDeclaration = classDeclarationPath => {
  const functionBody = iterateClassDeclarationBody(classDeclarationPath);
  const functionBody_concat_useEffect = concatUseEffectStatements(functionBody);
  return t.functionDeclaration(
    t.identifier(classDeclarationPath.node.id.name),
    [t.identifier("props")],
    t.blockStatement(functionBody_concat_useEffect)
  );
};

const concatUseEffectStatements = functionBody => {
  // const useEffectContents = [];
  // let firstUseEffectIndex = null;
  // functionBody.forEach((x, index) => {
  //   if (
  //     x.type === "ExpressionStatement" &&
  //     (x.callee || {}).name === "useEffect"
  //   ) {
  //     if (firstUseEffectIndex !== null) {
  //       firstUseEffectIndex = index;
  //     }
  //     (x.arguments || []).forEach(arg => {
  //       if (arg.type === "ArrowFunctionExpression") {
  //         const argBody = (arg.body || {}).body || [];
  //         if (argBody.length > 0) {
  //           argBody.forEach(argB => {
  //             useEffectContents.push(argB);
  //           });
  //         }
  //       }
  //     });
  //   }
  // });
  return functionBody;
};

const iterateClassDeclarationBody = classDeclarationPath => {
  const classBody = classDeclarationPath.get("body");
  const body = classBody.get("body");
  if (Array.isArray(body)) {
    return body.reduce((acc, item) => {
      const result = transformClassBodyMember(item);
      if (result) {
        if (Array.isArray(result)) {
          return acc.concat(result);
        } else {
          acc.push(result);
        }
      }
      return acc;
    }, []);
  }
  return [];
};

/**
 * Switch between different types of nodes and return the transformed node
 * @param {path} path
 * @returns {node}
 */
const transformClassBodyMember = path => {
  if (t.isClassProperty(path)) return classPropertyToVariableDeclaration(path);
  if (t.isClassMethod(path)) return switchClassMethods(path);
  return t.blockStatement([]);
};

const classPropertyToVariableDeclaration = path => {
  const name = path.get("key").get("name").node;
  if (name === "state") {
    return generateStateHooksFromClassProperty(path);
  } else {
    exportStateSettersOutOfPath(path);

    return t.variableDeclaration("const", [
      t.variableDeclarator(t.identifier(name), path.get("value").node)
    ]);
  }
};

/**
 * Switch between different class method names and return the appropriate type
 * @param {path} path
 * @returns {node}
 */
const switchClassMethods = path => {
  if (path.get("kind").node === "constructor") {
    return exportStateOutOfConstructor(path);
  }

  const name = path.get("key").get("name").node;
  switch (name) {
    case "render":
      return renderMethodToReturnStatement(path);
    case "componentDidMount":
    case "componentDidUpdate":
    case "componentWillUnmount":
      return lifecycleMethodToUseEffect(path);
    default:
      return null;
  }
};

/**
 * Convert render method to return statement
 * @param {path} classMethodPath
 * @returns {node}
 */
const renderMethodToReturnStatement = classMethodPath => {
  const classMethodBody = classMethodPath.get("body");
  const returnStatementPath = classMethodBody
    .get("body")
    .find(x => t.isReturnStatement(x));
  return removeThisExpression(returnStatementPath).node;
};

/**
 * Convert life cycle method to useEffect expression statement
 * @param {path} classMethodPath
 * @returns {node} useEffect expression statement
 */
const lifecycleMethodToUseEffect = classMethodPath => {
  exportStateSettersOutOfPath(classMethodPath);
  return t.expressionStatement(
    t.callExpression(t.identifier("useEffect"), [
      t.arrowFunctionExpression(
        [],
        t.blockStatement(classMethodPath.node.body.body)
      )
    ])
  );
};

exports.buildFunctionFromClassDeclaration = buildFunctionFromClassDeclaration;
