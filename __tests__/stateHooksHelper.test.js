const { types: t } = require("@babel/core");
const { default: generate } = require("@babel/generator");
const {
  generateStateHook,
  generateSetterName
} = require("../src/helpers/stateHooksHelper");

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
