import { yupResolver } from "@hookform/resolvers/yup";
import { ChevronDown } from "lucide-react";
import { useState } from "react";
import { useForm } from "react-hook-form";
import InputField from "../../../components/customInputField";
import userMasterSchema from "../../../validation/userMasterSchema";

const UserMasterDrawer = ({ open, onClose }) => {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: yupResolver(userMasterSchema),
    defaultValues: {
      firstName: "",
      middleName: "",
      lastName: "",
      gender: "select",
      dob: "",
      email: "",
      contact: "",
      address: "",
      userName: "",
      password: "",
      confirmPassword: "",
      userDepartmentId: "",
    },
  });

  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  const onSubmit = e => {
    e.preventDefault();
    console.log("submit button is clicked!!");
  };

  return (
    <>
      <div
        className={`fixed inset-0 bg-black/40 backdrop-blur-sm z-40 transition-opacity duration-300 ${
          open ? "opacity-100 visible" : "opacity-0 invisible"
        }`}
        onClick={onClose}
      />

      <div
        className={`fixed top-0 right-0 h-full w-full sm:w-[480px] md:w-[600px] lg:w-[700px] bg-gray-100 shadow-xl z-50 transition-transform duration-300 overflow-y-auto ${
          open ? "translate-x-0" : "translate-x-full"
        }`}
      >
        <div className="flex  justify-between items-center p-4 border-b border-gray-300 bg-gray-100 sticky top-0 z-10">
          <div className="flex flex-col">
            <h2 className="text-lg font-semibold text-gray-800">Add New User</h2>
            <p className="text-sm text-red-500 mt-1">Fields marked with * are required</p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-600 hover:text-black text-2xl leading-none"
          >
            ×
          </button>
        </div>

        <form className="p-4 space-y-4" onSubmit={handleSubmit(onSubmit)}>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <InputField label="First Name" required={true}>
                <input
                  type="text"
                  {...register("firstName")}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-white focus:ring-indigo-500 focus:border-indigo-500 outline-none transition"
                />
              </InputField>
              {errors.firstName && (
                <p className="text-red-500 text-sm">{errors.firstName?.message}</p>
              )}
            </div>
            <InputField label="Middle Name" required={false}>
              <input
                type="text"
                {...register("middleName")}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-white focus:ring-indigo-500 focus:border-indigo-500 outline-none transition"
              />
            </InputField>

            <InputField label="Last Name" required={false}>
              <input
                type="text"
                {...register("lastName")}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-white focus:ring-indigo-500 focus:border-indigo-500 outline-none transition"
              />
            </InputField>

            <div>
              <InputField label="Gender" required={true}>
                <div className="relative">
                  <select
                    {...register("gender")}
                    className="appearance-none w-full px-4 py-2 border border-gray-300 rounded-lg bg-white focus:ring-indigo-500 focus:border-indigo-500 outline-none transition"
                  >
                    <option value="">Select</option>
                  </select>
                </div>
                <ChevronDown className="w-4 h-4 absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 pointer-events-none" />
              </InputField>
              {errors.gender && <p className="text-red-500 text-sm">{errors.gender?.message}</p>}
            </div>
            <div>
              <InputField label="Date of Birth" required={true}>
                <input
                  type="date"
                  {...register("dob")}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-white focus:ring-indigo-500 focus:border-indigo-500 outline-none transition"
                />
              </InputField>

              <InputField label="Password" required={true}>
                <input
                  type="password"
                  {...register("password")}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-white focus:ring-indigo-500 focus:border-indigo-500 outline-none transition"
                />
              </InputField>
              {errors.password && (
                <p className="text-red-500 text-sm">{errors.password?.message}</p>
              )}
            </div>
            <div>
              <InputField label="Confirm Password" required={true}>
                <input
                  type="password"
                  {...register("confirmPassword")}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-white focus:ring-indigo-500 focus:border-indigo-500 outline-none transition"
                />
              </InputField>
              {errors.confirmPassword && (
                <p className="text-red-500 text-sm">{errors.confirmPassword?.message}</p>
              )}
            </div>

            <div>
              <InputField label="Email" required={true}>
                <input
                  type="email"
                  {...register("email")}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-white focus:ring-indigo-500 focus:border-indigo-500 outline-none transition"
                />
              </InputField>
              {errors.email && <p className="text-red-500 text-sm">{errors.email?.message}</p>}
            </div>

            <InputField label="Contact" required={true}>
              <input
                type="text"
                {...register("contact")}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-white focus:ring-indigo-500 focus:border-indigo-500 outline-none transition"
              />
            </InputField>

            <InputField label="Status" required={false}>
              <input
                type="text"
                {...register("status")}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-white focus:ring-indigo-500 focus:border-indigo-500 outline-none transition"
              />
            </InputField>

            <InputField label="User Name" required={true}>
              <input
                type="text"
                {...register("userName")}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-white focus:ring-indigo-500 focus:border-indigo-500 outline-none transition"
              />
            </InputField>

            <InputField label="User Department ID" required={false}>
              <input
                type="text"
                {...register("userDepartmentId")}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-white focus:ring-indigo-500 focus:border-indigo-500 outline-none transition"
              />
            </InputField>

            <button
              className="w-full px-6 py-2 bg-[#1e6da1] text-white rounded-lg hover:bg-blue-600 transition-colors font-medium"
              type="submit"
            >
              Create New User
            </button>
          </div>
        </form>
      </div>
    </>
  );
};

export default UserMasterDrawer;
