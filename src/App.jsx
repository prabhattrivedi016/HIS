import { Route, BrowserRouter as Router, Routes } from "react-router-dom";
import { ThemeProvider } from "./context/ThemeContext";
import "./index.css";
import Dashboard from "./screens/dashbord";
import Login from "./screens/login";
import Layout from "./screens/navbar/components/Layout";
import RoleMaster from "./screens/roleMaster";
import UserMaster from "./screens/userMaster";

const App = () => {
  return (
    <ThemeProvider>
      <Router>
        <Routes>
          {/* Public Route - Login  */}
          <Route path="/" element={<Login />} />

          {/* Protected Routes - With Sidebar & Header */}
          <Route element={<Layout />}>
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/role-master" element={<RoleMaster />} />
            <Route path="/user-master" element={<UserMaster />} />
          </Route>
        </Routes>
      </Router>
    </ThemeProvider>
  );
};

export default App;
