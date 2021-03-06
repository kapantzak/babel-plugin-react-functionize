const { types: t } = require("@babel/core");
const { default: template } = require("@babel/template");
const { default: generate } = require("@babel/generator");

/**
 * Takes the constructor path and exports any state as state hooks
 * @param {*} path
 * @returns {Array<nodes>}
 */
const exportStateOutOfConstructor = path => {
  const nodes = [];
  path.traverse(constructorVisitor, { nodes });
  return nodes;
};

const constructorVisitor = {
  AssignmentExpression(path) {
    if (isStateAssignmentExpression(path)) {
      generateStateHooks(path.node).forEach(x => {
        this.nodes.push(x);
      });
    }
  }
};

/**
 * Checks if the provided assignment expression is a state assignment
 * @param {path} assignmentExpressionPath
 * @returns {boolean}
 */
const isStateAssignmentExpression = assignmentExpressionPath => {
  let isState = false;
  assignmentExpressionPath.traverse({
    ThisExpression(path) {
      if (
        ((path.parentPath.get("property") || {}).node || {}).name === "state"
      ) {
        isState = true;
      }
    }
  });
  return isState;
};

const isStateCallExpression = callExpressionPath => {
  let isState = false;
  const callee = callExpressionPath.get("callee");
  if (
    t.isMemberExpression(callee) &&
    t.isThisExpression(callee.get("object")) &&
    t.isIdentifier(callee.get("property")) &&
    callee.get("property").get("name").node === "setState"
  ) {
    isState = true;
  }
  return isState;
};

/**
 * Extracts the properties of a state assignment expression and returns state hooks expression nodes
 * @param {node} assignmentExpressionNode
 * @returns {Array<nodes>}
 */
const generateStateHooks = assignmentExpressionNode => {
  const leftMemberExpressionLiteral = generate(assignmentExpressionNode.left, {
    concise: true
  }).code;
  if (leftMemberExpressionLiteral === "this.state") {
    if (t.isObjectExpression(assignmentExpressionNode.right)) {
      const stateProps =
        (assignmentExpressionNode.right || {}).properties || [];
      return stateProps.map(prop => generateStateHook(prop));
    }
  } else {
    const tokens = leftMemberExpressionLiteral.split(".");
    if (tokens.length === 3 && tokens.slice(0, 2).join(".") === "this.state") {
      const prop = t.objectProperty(
        t.identifier(tokens[2]),
        assignmentExpressionNode.right
      );
      return [prop].map(prop => generateStateHook(prop));
    }
  }
};

const generateStateHooksFromClassProperty = path => {
  const hooks = [];
  path.traverse({
    ObjectProperty(path) {
      hooks.push(generateStateHook(path.node));
    }
  });
  return hooks;
};

/**
 * Converts an assignment expression property to a variable declaration
 * @param {node} prop
 * @returns {node}
 */
const generateStateHook = prop => {
  const getterName = prop.key.name;
  const setterName = generateSetterName(getterName);

  const buildRequire = template`
    const [GETTER, SETTER] = useState(DEFAULT_VALUE);
  `;

  return buildRequire({
    GETTER: t.identifier(getterName),
    SETTER: t.identifier(setterName),
    DEFAULT_VALUE: prop.value
  });
};

/**
 * Generates a setter name for a given property name
 * @param {string} propName
 * @returns {string}
 */
const generateSetterName = propName => {
  if (propName && propName.length > 0) {
    const sliced = propName.length > 1 ? propName.slice(1) : "";
    return `set${propName[0].toUpperCase()}${sliced}`;
  }
  return null;
};

const exportStateSettersOutOfPath = path => {
  path.traverse(stateSetterVisitor);
};

const stateSetterVisitor = {
  CallExpression(path) {
    if (isStateCallExpression(path)) {
      path.replaceWithMultiple(generateStateSetterFromCallExpression(path));
    }
  },
  AssignmentExpression(path) {
    if (isStateAssignmentExpression(path)) {
      path.replaceWith(generateStateSetterFromAssignment(path));
    }
  }
};

const generateStateSetterFromCallExpression = callExpressionPath => {
  return callExpressionPath.node.arguments[0].properties.map(x =>
    t.callExpression(t.identifier(generateSetterName(x.key.name)), [x.value])
  );
};

/**
 * Convert a state assignment expression to the appropriate state setter call expression
 * @param {path} stateAssignmentExpressionPath
 * @returns {node}
 */
const generateStateSetterFromAssignment = stateAssignmentExpressionPath => {
  const stateAssignmentExpressionNode = stateAssignmentExpressionPath.node;
  const leftMemberExpressionLiteral = generate(
    stateAssignmentExpressionNode.left,
    {
      concise: true
    }
  ).code;

  const tokens = leftMemberExpressionLiteral.split(".");
  if (tokens.length === 3 && tokens.slice(0, 2).join(".") === "this.state") {
    return t.callExpression(t.identifier(generateSetterName(tokens[2])), [
      stateAssignmentExpressionNode.right
    ]);
  }
};

exports.exportStateOutOfConstructor = exportStateOutOfConstructor;
exports.exportStateSettersOutOfPath = exportStateSettersOutOfPath;
exports.isStateAssignmentExpression = isStateAssignmentExpression;
exports.generateStateHooks = generateStateHooks;
exports.generateStateHooksFromClassProperty = generateStateHooksFromClassProperty;
exports.generateStateHook = generateStateHook;
exports.generateSetterName = generateSetterName;
