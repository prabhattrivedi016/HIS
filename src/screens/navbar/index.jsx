import { Route, BrowserRouter as Router, Routes } from "react-router-dom";
import Dashboard from "../dashbord";
import Login from "../login";
import RoleMaster from "../roleMaster";
import UserMaster from "../userMaster";
import Sidebar from "./components/Sidebar";

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
          <Route path="/user-master" element={<UserMaster />} />
        </Route>
      </Routes>
    </Router>
  );
};

export default Navbar;
