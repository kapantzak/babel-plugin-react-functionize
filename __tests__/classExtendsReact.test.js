const { types: t } = require("@babel/core");
const { classExtendsReact } = require("../src/helpers/classExtendsReact");

describe("classExtendsReact()", () => {
  it("Should return false if superclass is null", () => {
    const classDec = t.classDeclaration("Test", null, null);
    const actual = classExtendsReact(classDec);
    expect(actual).toBe(false);
  });

  test.each([
    ["Component", t.identifier("Component")],
    ["PureComponent", t.identifier("PureComponent")],
    [
      "React.Component",
      t.memberExpression(t.identifier("React"), t.identifier("Component"))
    ],
    [
      "React.PureComponent",
      t.memberExpression(t.identifier("React"), t.identifier("PureComponent"))
    ]
  ])("Should return true if superclass is '%s'", (_, superClassNode) => {
    const classDec = t.classDeclaration("Test", superClassNode, null);
    const actual = classExtendsReact(classDec);
    expect(actual).toBe(true);
  });
});
