import React from "react";

class App extends React.Component {
  alertName = () => {
    alert("John Doe");
  };

  render() {
    return (
      <div>
        <h3> This is a Class Component </h3>
        <button onClick={this.alertName}> Alert </button>
        <button onClick={this.foo.bar}> Alert </button>
        <button onClick={foo.bar}> Alert </button>
      </div>
    );
  }
}

export default App;
