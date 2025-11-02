import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Login from "../Login/Login";
import Sidebar from "../../Sidebar/Sidebar";
import Dashboard from "../Dashbord/Dashboard";
import RoleMaster from "../../RoleMaster/RoleMaster";

const Navbar = () => {
  return (
    <Router>
      <Routes>
        {/* Public Route (No Sidebar) */}
        <Route path="/" element={<Login />} />

        {/* Protected Routes (With Sidebar) */}
        <Route element={<Sidebar />}>
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/role-master" element={<RoleMaster />} />
          <Route path="/user-master" element={<h1>User Master Page</h1>} />
        </Route>
      </Routes>
    </Router>
  );
};

export default Navbar;
