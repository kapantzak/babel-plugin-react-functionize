const { types: t } = require("@babel/core");

const removeThisExpression = path => {
  path.traverse(thisExpressionVisitor);
  return path;
};

const thisExpressionVisitor = {
  ThisExpression(path) {
    const identifier = t.identifier(path.parent.property.name);
    path.parentPath.replaceWith(identifier);
  }
};

exports.removeThisExpression = removeThisExpression;
exports.thisExpressionVisitor = thisExpressionVisitor;
