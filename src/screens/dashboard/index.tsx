import { useEffect, useState } from "react";
import AdminDashboard from "./components/AdminDashboard";
import FrontOfficeDashboard from "./components/FrontOfficeDashboard";

const Dashboard = () => {
  const [definedRole, setDefinedRole] = useState<string | null>(null);

  useEffect(() => {
    const role = localStorage.getItem("roleName") || localStorage.getItem("selectedRole") || "";

    setDefinedRole(role.trim().toLowerCase());
  }, [definedRole]);

  const renderDashboard = (role: string | null) => {
    if (!role) return <p className="flex justify-center items-center">Loading...</p>;

    switch (role) {
      case "admin":
        return <AdminDashboard />;

      case "front office":
        return <FrontOfficeDashboard />;

      default:
        return <h1>Unauthorized Role</h1>;
    }
  };

  return <div>{renderDashboard(definedRole)}</div>;
};

export default Dashboard;
