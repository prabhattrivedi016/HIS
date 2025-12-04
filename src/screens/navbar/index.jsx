import { Route, BrowserRouter as Router, Routes } from "react-router-dom";
import Dashboard from "../dashbord";
import Login from "../login";
import RoleMaster from "../roleMaster";
import UserDepartment from "../userDepartment";
import UserGroupMaster from "../userGroupMaster";
import UserMaster from "../userMaster";
import Sidebar from "./components/Sidebar";

const Navbar = () => {
  return (
    <Router>
      <Routes>
        {/* Public Route - Login  */}
        <Route path="/" element={<Login />} />

        {/* Protected Routes - With Sidebar & Header */}
        <Route element={<Sidebar />}>
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/role-master" element={<RoleMaster />} />
          <Route path="/user-master" element={<UserMaster />} />
          <Route path="/user-group" element={<UserGroupMaster />} />
          <Route path="/user-department" element={<UserDepartment />} />
        </Route>
      </Routes>
    </Router>
  );
};

export default Navbar;
