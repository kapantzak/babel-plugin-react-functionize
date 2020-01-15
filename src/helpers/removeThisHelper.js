const removeThisExpression = path => {
  path.traverse(thisExpressionVisitor);
  return path;
};

const thisExpressionVisitor = {
  ThisExpression(path) {
    console.log(path);
  }
};

exports.removeThisExpression = removeThisExpression;
