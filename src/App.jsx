import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import "./index.css";
import Login from "./components/Login/Login";
import Dashboard from "./components/Dashbord/Dashboard";

const App = () => {
  return (
    <Router>
      <Routes>
        {/* login  */}
        <Route path="/" element={<Login />} />

        {/* dashboard*/}
        <Route path="/dashboard" element={<Dashboard />} />
      </Routes>
    </Router>
  );
};

export default App;
