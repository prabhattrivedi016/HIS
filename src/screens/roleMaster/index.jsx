import React, { useState } from "react";
import RoleMasterProfile from "../profileCards/RoleMasterProfile";
import RoleMasterHeader from "./components/RoleMasterHeader";

const Role = [
  {
    id: "001",
    role: "admin",
    status: "Active",
    lastModified: "1 Jan 2025",
    modifiedBy: "Ram",
  },
  {
    id: "002",
    role: "admin",
    status: "In Active",
    lastModified: "1 Jan 2025",
    modifiedBy: "Ram",
  },
  {
    id: "003",
    role: "admin",
    status: "Active",
    lastModified: "1 Jan 2025",
    modifiedBy: "Ram",
  },
  {
    id: "004",
    role: "admin",
    status: "In Active",
    lastModified: "1 Jan 2025",
    modifiedBy: "Ram",
  },
  {
    id: "005",
    role: "admin",
    status: "Active",
    lastModified: "1 Jan 2025",
    modifiedBy: "Ram",
  },
  {
    id: "006",
    role: "admin",
    status: "In Active",
    lastModified: "1 Jan 2025",
    modifiedBy: "Ram",
  },
  {
    id: "007",
    role: "admin",
    status: "Active",
    lastModified: "1 Jan 2025",
    modifiedBy: "Ram",
  },
  {
    id: "008",
    role: "admin",
    status: "In Active",
    lastModified: "1 Jan 2025",
    modifiedBy: "Ram",
  },
  {
    id: "009",
    role: "admin",
    status: "Active",
    lastModified: "1 Jan 2025",
    modifiedBy: "Ram",
  },
  {
    id: "010",
    role: "admin",
    status: "In Active",
    lastModified: "1 Jan 2025",
    modifiedBy: "Ram",
  },
  {
    id: "011",
    role: "admin",
    status: "Active",
    lastModified: "1 Jan 2025",
    modifiedBy: "Ram",
  },
];

const RoleMaster = () => {
  return (
    <div className="flex-1 w-half-screen min-h-screen bg-gray-100 -mt-4 -mx-4">
      <RoleMasterHeader />

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 px-4 py-4">
        {Role.map((user) => (
          <RoleMasterProfile user={user} key={user.id} />
        ))}
      </div>
    </div>
  );
};

export default RoleMaster;
