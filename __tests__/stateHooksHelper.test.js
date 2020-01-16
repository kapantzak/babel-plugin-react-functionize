const { types: t } = require("@babel/core");
const { default: generate } = require("@babel/generator");
const {
  memberExpressionIsState,
  generateStateHook,
  generateSetterName
} = require("../src/helpers/stateHooksHelper");

describe("memberExpressionIsState()", () => {
  it("Should return true for 'this.state'", () => {
    const memberExpression = t.memberExpression(
      t.thisExpression(),
      t.identifier("state")
    );
    const result = memberExpressionIsState(memberExpression);
    expect(result).toBe(true);
  });

  it("Should return false for 'this.foo'", () => {
    const memberExpression = t.memberExpression(
      t.thisExpression(),
      t.identifier("foo")
    );
    const result = memberExpressionIsState(memberExpression);
    expect(result).toBe(false);
  });

  it("Should return false for 'foo.bar'", () => {
    const memberExpression = t.memberExpression(
      t.identifier("foo"),
      t.identifier("bar")
    );
    const result = memberExpressionIsState(memberExpression);
    expect(result).toBe(false);
  });

  //   it("Should return false for 'this.state.bar'", () => {
  //     const memberExpression = t.memberExpression(
  //       t.memberExpression(t.thisExpression(), t.identifier("state")),
  //       t.identifier("bar")
  //     );
  //     const result = memberExpressionIsState(memberExpression);
  //     expect(result).toBe(false);
  //   });
});

describe("generateStateHook()", () => {
  it("Should return the correct declaration for 'propName': 'propValue'", () => {
    const objectProperty = t.objectProperty(
      t.identifier("propName"),
      t.stringLiteral("propValue")
    );
    const result = generateStateHook(objectProperty);

    const actual = generate(result, {
      concise: true
    }).code;
    const expected = `const [propName, setPropName] = useState("propValue");`;
    expect(actual).toBe(expected);
  });

  it("Should return the correct declaration for 'propName': 0", () => {
    const objectProperty = t.objectProperty(
      t.identifier("propName"),
      t.numericLiteral(0)
    );
    const result = generateStateHook(objectProperty);

    const actual = generate(result, {
      concise: true
    }).code;
    const expected = `const [propName, setPropName] = useState(0);`;
    expect(actual).toBe(expected);
  });

  it("Should return the correct declaration for 'propName': { foo: 'bar' }", () => {
    const objectProperty = t.objectProperty(
      t.identifier("propName"),
      t.objectExpression([
        t.objectProperty(t.identifier("foo"), t.stringLiteral("bar"))
      ])
    );
    const result = generateStateHook(objectProperty);

    const actual = generate(result, {
      concise: true
    }).code;
    const expected = `const [propName, setPropName] = useState({ foo: "bar" });`;
    expect(actual).toBe(expected);
  });
});

describe("generateSetterName()", () => {
  it("Should return 'setName' for prop name 'name'", () => {
    const expected = "setName";
    const actual = generateSetterName("name");
    expect(actual).toBe(expected);
  });

  it("Should return 'setA' for prop name 'a'", () => {
    const expected = "setA";
    const actual = generateSetterName("a");
    expect(actual).toBe(expected);
  });

  it("Should return null if provided with empty string", () => {
    const actual = generateSetterName("");
    expect(actual).toBeNull();
  });

  it("Should return null if provided with undefined", () => {
    const actual = generateSetterName();
    expect(actual).toBeNull();
  });
});
