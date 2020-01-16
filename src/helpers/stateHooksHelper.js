const { types: t } = require("@babel/core");
const { default: template } = require("@babel/template");
const { default: generate } = require("@babel/generator");

/**
 * Takes the constructor path and exports any state as state hooks
 * @param {*} path
 * @returns {nodes}
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

exports.exportStateOutOfConstructor = exportStateOutOfConstructor;
// exports.memberExpressionIsState = memberExpressionIsState;
exports.generateStateHook = generateStateHook;
exports.generateSetterName = generateSetterName;
