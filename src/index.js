import React from "react";
import { render } from "react-dom";
import "./scss.scss";

const App = () => (
  <div className="container">
    <h1>webpack courses</h1>
  </div>
);

render(<App />, document.getElementById("app"));
