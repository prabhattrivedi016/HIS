import React, { useState } from "react";
import { User, MoreVertical } from "lucide-react";
import { color } from "framer-motion";

const menuItems = [
  { label: "View Profile", color: "text-blue-500" },
  { label: "status", color: "text-blue-500" },
  { label: "View Profile", color: "text-blue-500" },
  { label: "status", color: "text-blue-500" },
  { label: "View Profile", color: "text-blue-500" },
];

const RoleMasterProfile = ({ user, lastModified, createdBy, modifiedBy }) => {
  return (
    <div className="bg-white shadow-md border border-gray-200 relative hover:shadow-lg transition-all duration-300 w-full roundrd-md">
      {/* profile card header */}
      <div className="p-1 m-4 flex items-center justify-between">
        <span
          className={`font-semibold text-sm px-3 py-1 rounded ${
            user.status === "Active"
              ? "text-purple-800 bg-blue-50"
              : "text-orange-500 bg-orange-100"
          }`}
        >
          {user.status}
        </span>
      </div>

      {/* avatar */}
      <div className="flex flex-col items-center pb-4 m-2">
        <div className="w-20 h-20 rounded-full border border-gray-300 flex items-center justify-center bg-gray-50">
          <User size={40} className="text-gray-700" />
        </div>

        <p className="text-gray-500 text-sm mt-2 mb-1">#{user.id}</p>
        <h2 className="text-2xl font-bold text-gray-800">{user.role}</h2>
      </div>

      {/* info */}
      <div className="border border-t border-gray-200 pt-1 rounded-lg p-3 mb-2 mx-2 my-2">
        <div className="grid grid-cols-3 gap-4 text-center">
          <div>
            <p
              className="text-black-500 text-sm font-medium
             mb-1"
            >
              Created By
            </p>
            <p className="text-gray-500 font-semibold text-sm">{user.role}</p>
          </div>

          <div className="border-l border-r  border-gray-200 px-2">
            <p
              className="text-black-500 text-sm  font-medium
             mb-1"
            >
              Last Modified
            </p>
            <p className="text-gray-500 font-semibold text-sm">
              {user.lastModified}
            </p>
          </div>

          <div>
            <p
              className="text-black-500 text-sm  font-medium
             mb-1"
            >
              Modified By
            </p>
            <p className="text-gray-500 font-semibold text-sm">
              {user.modifiedBy}
            </p>
          </div>
        </div>
      </div>
      <div className="flex gap-3 mt-3 mx-2 my-2">
        <button className="flex-1 bg-[#1e6da1] text-white py-2 rounded-lg font-medium hover:bg-blue-900 transition">
          Active
        </button>

        <button className="flex-1 bg-gray-300 text-gray-700 py-2 rounded-lg font-medium hover:bg-gray-500 transition">
          Edit
        </button>
      </div>
    </div>
  );
};

export default RoleMasterProfile;
