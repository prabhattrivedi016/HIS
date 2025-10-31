import React, { useEffect, useState } from "react";
import Button from "../Atomic/Button";
import InputField from "../Atomic/InputField";
import { ChevronDown, User } from "lucide-react";
import { userSignup } from "../../api/AuthServices";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import signupSchema from "../../validation/signupSchema";
import { genderOptions } from "../../constants/constants";
import { stopPropagationHandler } from "../../utils/utilities";
import UsePickMaster from "../../Hook/UsePickMaster";

const Signup = ({ onLoginClick }) => {
  const { pickMasterValue, getPickMasterValue } = UsePickMaster();
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    setError,
  } = useForm({
    resolver: yupResolver(signupSchema),
    defaultValues: {
      firstName: "",
      middleName: "",
      lastName: "",
      gender: "Select",
      email: "",
      dob: "",
      contact: "",
      address: "",
      userName: "",
      password: "",
      confirmPassword: "",
    },
  });

  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  //picMaster Values for gender
  useEffect(() => {
    getPickMasterValue("gender");
  }, []);

  // Handle submit
  const onSubmit = async (data) => {
    try {
      const response = await userSignup(data);
      setSuccessMessage(response?.data?.message);
      setErrorMessage("");

      setTimeout(() => {
        onLoginClick();
      }, 2000);
    } catch (err) {
      const apiMessage = err?.response?.data?.message;

      setErrorMessage(apiMessage || "Something went wrong. Please try again.");
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center 
             bg-linear-to-br from-indigo-900/60 via-black/50 to-indigo-800/50
             backdrop-blur-md p-6"
      onClick={onLoginClick}
    >
      <div
        className="relative bg-white rounded-3xl shadow-2xl border border-indigo-100 
                   w-full max-w-3xl max-h-[90vh] overflow-y-auto p-10"
        onClick={stopPropagationHandler}
      >
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-800 flex items-center gap-4 justify-center">
            Create New Account
          </h1>
          <p className="text-sm text-red-500 mt-1">
            Fields marked with * are required
          </p>
        </div>
        <div className="mb-4">
          {successMessage && (
            <div className="animate-fade-in px-4 py-3 rounded-xl bg-green-100 border border-green-300 text-green-700 text-center font-medium shadow-sm">
              {successMessage}
            </div>
          )}
          {/* success & error message */}
          {errorMessage && (
            <div className="animate-fade-in px-4 py-3 rounded-xl bg-red-100 border border-red-300 text-red-700 text-center font-medium shadow-sm">
              {errorMessage}
            </div>
          )}
        </div>

        <form className="space-y-4" onSubmit={handleSubmit(onSubmit)}>
          {/* First & Last Name */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <InputField label="First Name " required={true}>
                <input
                  type="text"
                  {...register("firstName")}
                  className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500 outline-none transition"
                />
              </InputField>
              {errors.firstName && (
                <p className="text-red-500 text-sm">
                  {errors.firstName?.message}
                </p>
              )}
            </div>
            <div>
              <InputField label="Last Name">
                <input
                  type="text"
                  {...register("lastName")}
                  className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500 outline-none transition"
                />
              </InputField>
            </div>
          </div>

          {/* Gender + Email */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <InputField label="Gender " required={true}>
                <div className="relative">
                  <select
                    {...register("gender")}
                    className="appearance-none w-full px-4 py-2 border border-gray-300 rounded-lg bg-white focus:ring-indigo-500 focus:border-indigo-500 outline-none transition"
                  >
                    <option value="">Select</option>

                    {pickMasterValue?.data?.map((item) => (
                      <option key={item.id} value={item.value}>
                        {item.value}
                      </option>
                    ))}
                  </select>

                  <ChevronDown className="w-4 h-4 absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 pointer-events-none" />
                </div>
              </InputField>
              {errors.gender && (
                <p className="text-red-500 text-sm">{errors.gender?.message}</p>
              )}
            </div>

            <div>
              <InputField label="Email " required={true}>
                <input
                  type="text"
                  {...register("email")}
                  className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500 outline-none transition"
                />
              </InputField>
              {errors.email && (
                <p className="text-red-500 text-sm">{errors.email?.message}</p>
              )}
            </div>
          </div>

          {/* DOB + Contact */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <InputField label="Date of Birth " required={true}>
                <input
                  type="date"
                  {...register("dob")}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500 outline-none transition"
                />
              </InputField>
              {errors.dob && (
                <p className="text-red-500 text-sm">{errors.dob?.message}</p>
              )}
            </div>
            <div>
              <InputField label="Contact Number " required={true}>
                <input
                  type="text"
                  {...register("contact")}
                  className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500 outline-none transition"
                />
              </InputField>
              {errors.contact && (
                <p className="text-red-500 text-sm">
                  {errors.contact?.message}
                </p>
              )}
            </div>
          </div>

          {/* Address + Username */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <InputField label="Address " required={true}>
                <input
                  type="text"
                  {...register("address")}
                  className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500 outline-none transition"
                />
              </InputField>
              {errors.address && (
                <p className="text-red-500 text-sm">
                  {errors.address?.message}
                </p>
              )}
            </div>
            <div>
              <InputField label="Username " required={true}>
                <input
                  type="text"
                  {...register("userName")}
                  className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500 outline-none transition"
                />
              </InputField>
              {errors.userName && (
                <p className="text-red-500 text-sm">
                  {errors.userName?.message}
                </p>
              )}
            </div>
          </div>

          {/* Password Fields */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <InputField label="Password " required={true}>
                <input
                  type="password"
                  {...register("password")}
                  className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500 outline-none transition"
                />
              </InputField>
              {errors.password && (
                <p className="text-red-500 text-sm">
                  {errors.password?.message}
                </p>
              )}
            </div>
            <div>
              <InputField label="Confirm Password " required={true}>
                <input
                  type="password"
                  {...register("confirmPassword")}
                  className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500 outline-none transition"
                />
              </InputField>
              {errors.confirmPassword && (
                <p className="text-red-500 text-sm">
                  {errors.confirmPassword?.message}
                </p>
              )}
            </div>
          </div>

          {/* Submit */}
          <Button
            type="submit"
            className="w-full flex items-center justify-center gap-2 mt-4"
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              "Creating..."
            ) : (
              <>
                <User size={18} /> CREATE USER
              </>
            )}
          </Button>
        </form>
        {/* Footer */}
        <div className="text-center mt-6">
          <p className="text-gray-600 text-sm">
            Already have an account?{" "}
            <span
              onClick={onLoginClick}
              className="text-indigo-600 font-semibold hover:underline cursor-pointer"
            >
              Log In
            </span>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Signup;
