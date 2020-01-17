const { parse } = require("@babel/parser");
const { default: traverse } = require("@babel/traverse");
const { default: generate } = require("@babel/generator");
const { thisExpressionVisitor } = require("../src/helpers/removeThisHelper");

describe("thisExpressionVisitor", () => {
  test.each([
    ["this.foo;", "foo;"],
    ["this.foo.bar;", "foo.bar;"],
    ["foo.bar;", "foo.bar;"]
  ])("Should visit '%s' and return '%s'", (input, output) => {
    const ast = parse(input);
    traverse(ast, thisExpressionVisitor);
    const actual = generate(ast).code;
    expect(actual).toBe(output);
  });
});
