import React, { Component, useEffect } from "react";

class App extends Component {
  state = {
    userName: "JD",
    firstName: "John",
    lastName: "Doe",
    count: 0
  };

  componentDidMount() {
    setInterval(() => {
      this.setState({
        // update state
        userName: "MJ",
        firstName: "Mary",
        lastName: "jane"
      });
    }, 5000);
  }

  logName = () => {
    // do whatever with the names ... let's just log them here
    console.log(this.state.userName);
    console.log(this.state.firstName);
    console.log(this.state.lastName);
  };

  handleUserNameInput = e => {
    this.setState({ userName: e.target.value });
  };
  handleFirstNameInput = e => {
    this.setState({ firstName: e.target.value });
  };
  handleLastNameInput = e => {
    this.setState({ lastName: e.target.value });
  };

  render() {
    return (
      <div>
        <h3> The text fields will update in 5 seconds </h3>
        <input
          type="text"
          onChange={this.handleUserNameInput}
          value={this.state.userName}
          placeholder="Your username"
        />
        <input
          type="text"
          onChange={this.handleFirstNameInput}
          value={this.state.firstName}
          placeholder="Your firstname"
        />
        <input
          type="text"
          onChange={this.handleLastNameInput}
          value={this.state.lastName}
          placeholder="Your lastname"
        />
        <button className="btn btn-large right" onClick={this.logName}>
          {" "}
          Log Names{" "}
        </button>
      </div>
    );
  }
}

export default App;
