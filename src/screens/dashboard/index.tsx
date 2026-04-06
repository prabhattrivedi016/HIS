import { RoleContext } from "@/context/RoleContext";
import { useContext } from "react";
import { getAuthStorage } from "../../utils/authStorage";
import AdminDashboard from "./components/AdminDashboard";
import DashboardShimmer from "./components/DashboardShimmer";
import DayCareDashboard from "./components/DayCareDashboard";
import FrontOfficeDashboard from "./components/FrontOfficeDashboard";

const Dashboard = () => {
  const roleContext = useContext(RoleContext);
  const storage = getAuthStorage();
  let storedRoleName: string | null = null;

  try {
    storedRoleName = JSON.parse(storage.getItem("role") || "{}")?.roleName || null;
  } catch {
    storedRoleName = null;
  }

  const definedRole = (roleContext?.roleName || storedRoleName || "").trim().toLowerCase();
  const normalizedRoleKey = definedRole.replace(/[\s-]/g, "");

  const renderDashboard = (role: string | null) => {
    if (!role) {
      return <DashboardShimmer />;
    }

    switch (normalizedRoleKey) {
      case "admin":
        return <AdminDashboard />;

      case "frontoffice":
        return <FrontOfficeDashboard />;

      case "daycare":
        return <DayCareDashboard />;

      default:
        return (
          <h1 className="justify-center items-center font-bold text-center m-auto text-3xl">
            Unauthorized Role
          </h1>
        );
    }
  };

  return <div>{renderDashboard(definedRole || null)}</div>;
};

export default Dashboard;
