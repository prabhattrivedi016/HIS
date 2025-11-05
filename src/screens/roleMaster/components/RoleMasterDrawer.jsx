import { yupResolver } from "@hookform/resolvers/yup";
import React from "react";
import { useForm } from "react-hook-form";
import { roleMasterSchema } from "../../../validation/roleMasterSchema";
import InputField from "../../../components/customInputField";

const RoleMasterDrawer = ({ open, onClose }) => {
  //  role master form
  const { register, handleSubmit } = useForm({
    resolver: yupResolver(roleMasterSchema),
    defaultValues: {
      roleName: "",
      roleId: "",
      isAcitve: "",
    },
  });
  return (
    <>
      {/* Overlay */}
      <div
        className={`fixed inset-0 bg-black/40 backdrop-blur-sm z-40 transition-opacity duration-300 ${
          open ? "opacity-100 visible" : "opacity-0 invisible"
        }`}
        onClick={onClose}
      />

      {/* Drawer Panel */}
      <div
        className={`fixed top-0 right-0 h-full w-150 bg-gray-100 shadow-xl z-50 transition-transform duration-300 ${
          open ? "translate-x-0" : "translate-x-full"
        }`}
      >
        {/* Drawer Header */}
        <div className="flex justify-between items-center p-4 border-b">
          <h2 className="text-lg font-semibold text-gray-800">Add New Role</h2>
          <button
            onClick={onClose}
            className="text-gray-600 hover:text-black text-xl leading-none"
          >
            ×
          </button>
        </div>

        {/* Drawer Body */}
        <div className="p-4">
          {/* Example Form */}
          <form className="space-y-4">
            <InputField label="Role Name" required={true}>
              <input
                {...register("roleName")}
                className="w-full px-4 py-2 border rounded-lg"
              />
            </InputField>
            {/* status: active & inActive */}
            <InputField label="Status" required={true}>
              <select
                {...register("status")}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-white focus:ring-indigo-500 focus:border-indigo-500 outline-none transition"
              >
                <option value="">Select</option>
                <option value="Active">Active</option>
                <option value="InActive">In Active</option>
              </select>
            </InputField>
            <InputField label="Role Icon" required={true}>
              <select
                {...register("fanIconId")}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-white focus:ring-indigo-500 focus:border-indigo-500 outline-none transition"
              >
                <option value="">Select</option>
                <option value="Active">fa fa-500px</option>
                <option value="InActive">fa fa-black-tie</option>
              </select>
            </InputField>
            <button
              type="submit"
              className="w-full py-2 bg-[#1e6da1] text-white rounded hover:bg-blue-600 transition-colors font-medium mt-5"
            >
              Create New Role
            </button>
          </form>
        </div>
      </div>
    </>
  );
};

export default RoleMasterDrawer;
