import React from "react";
import { BrowserRouter as Router } from "react-router-dom";
import RoutePage from "./Router/Router"; // this will contain the routing logic

const App = () => {
  return (
    <Router>
      <RoutePage />
    </Router>
  );
};

export default App;
