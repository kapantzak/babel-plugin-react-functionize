const { types: t } = require("@babel/core");
const { default: template } = require("@babel/template");

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
    if (isStateAssignmentExpression(path.node)) {
      generateStateHooks(path.node).forEach(x => {
        this.nodes.push(x);
      });
    }
  }
};

/**
 * Checks if the provided assignment expression is a state assignment
 * @param {node} assignmentExpressionNode
 * @returns {boolean}
 */
const isStateAssignmentExpression = assignmentExpressionNode => {
  const isEqualOperator = assignmentExpressionNode.operator === "=";
  const leftIsState = memberExpressionIsState(assignmentExpressionNode.left);
  return isEqualOperator && leftIsState;
};

/**
 * Checks if the provided member expression is a 'this.state' expression
 * @param {node} memberExpression
 * @returns {boolean}
 */
const memberExpressionIsState = memberExpression => {
  const hasThisExpression =
    ((memberExpression || {}).object || {}).type === "ThisExpression";
  const hasPropertyState =
    ((memberExpression || {}).property || {}).name === "state";
  return hasThisExpression && hasPropertyState;
};

/**
 * Extracts the properties of a state assignment expression and returns state hooks expression nodes
 * @param {node} assignmentExpressionNode
 * @returns {Array<nodes>}
 */
const generateStateHooks = assignmentExpressionNode => {
  const stateProps = (assignmentExpressionNode.right || {}).properties || [];
  return stateProps.map(prop => generateStateHook(prop));
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
exports.generateStateHook = generateStateHook;
exports.generateSetterName = generateSetterName;
