import React, { Component } from "react";

class App extends Component {
  constructor(props) {
    super(props);
    this.state = {
      count: 0,
      name: "John"
    };
    this.state.foo = "bar";
    this.state.age = 38;
    this.methodName = this.methodName.bind(this);
  }

  methodName = () => {
    this.state.name = "John";
  };

  componentDidMount() {
    console.log("test");
    this.state.count = 1;
    this.state.name = "John";
  }

  render() {
    return (
      <div>
        <input type="checkbox" onChange={this.methodName} />
      </div>
    );
  }
}

export default App;
