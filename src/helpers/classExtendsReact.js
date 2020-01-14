const { types: t } = require("@babel/core");

const classExtendsReact = node => {
  const reactClasses = ["Component", "PureComponent"];
  const sc = node.superClass;
  if (sc) {
    if (t.isIdentifier(sc)) {
      return reactClasses.some(x => sc.name === x);
    } else if (t.isMemberExpression(sc)) {
      const prop = sc.property;
      if (t.isIdentifier(prop)) return reactClasses.some(x => prop.name === x);
    }
  }
  return false;
};

exports.classExtendsReact = classExtendsReact;
