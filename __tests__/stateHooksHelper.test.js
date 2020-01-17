const { types: t } = require("@babel/core");
const { parse } = require("@babel/parser");
const { default: traverse } = require("@babel/traverse");
const { default: generate } = require("@babel/generator");
const {
  exportStateOutOfConstructor,
  isStateAssignmentExpression,
  generateStateHooks,
  generateStateHook,
  generateSetterName
} = require("../src/helpers/stateHooksHelper");

describe("exportStateOutOfConstructor()", () => {
  it("Should return the correct result", () => {
    const code = `class App extends Component {
      constructor(props) {
        super(props);    
        this.state = {count: 0};
      }
    }`;
    const ast = parse(code, {
      sourceType: "module",
      plugins: ["classes"]
    });
    const expectedStatement = "const [count, setCount] = useState(0);";
    traverse(ast, {
      ClassMethod(path) {
        if (path.node.kind === "constructor") {
          const result = exportStateOutOfConstructor(path);
          expect(result).toHaveLength(1);

          const actualStatement = generate(result[0], {
            concise: true
          }).code;
          expect(actualStatement).toBe(expectedStatement);
        }
      }
    });
  });
});

describe("isStateAssignmentExpression()", () => {
  test.each([
    [true, "this.state = { count: 0 };"],
    [true, "this.state.foo = 'bar';"],
    [false, "this.foo = 'bar';"],
    [false, "foo = 'bar';"]
  ])("Should return %s for '%s'", (expected, code) => {
    const assignment = parse(code);
    traverse(assignment, {
      AssignmentExpression(path) {
        const result = isStateAssignmentExpression(path);
        expect(result).toBe(expected);
      }
    });
  });
});

describe("generateStateHooks()", () => {
  it("Should return the correct result for 'this.state = { count: 0 };'", () => {
    const code = `this.state = {
      count: 0
    };`;
    const assignment = parse(code);
    const result = generateStateHooks(assignment.program.body[0].expression);
    const actual = generate(result[0], {
      concise: true
    }).code;
    const expected = `const [count, setCount] = useState(0);`;
    expect(actual).toBe(expected);
  });

  describe("Should return the correct result for 'this.state = { count: 0, name: 'John' }'", () => {
    const code = `this.state = {
      count: 0,
      name: 'John'
    }`;
    const assignment = parse(code);
    const result = generateStateHooks(assignment.program.body[0].expression);

    test.each([
      [0, "const [count, setCount] = useState(0);"],
      [1, "const [name, setName] = useState('John');"]
    ])("Returns %s", (index, expected) => {
      const actual = generate(result[index], {
        concise: true
      }).code;
      expect(actual).toBe(expected);
    });
  });

  it("Should return the correct result for 'this.state.foo = 'bar';'", () => {
    const code = `this.state.foo = 'bar';`;
    const assignment = parse(code);
    const result = generateStateHooks(assignment.program.body[0].expression);
    const actual = generate(result[0], {
      concise: true
    }).code;
    const expected = `const [foo, setFoo] = useState('bar');`;
    expect(actual).toBe(expected);
  });
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
