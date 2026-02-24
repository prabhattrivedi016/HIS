import { yupResolver } from "@hookform/resolvers/yup";
import { User } from "lucide-react";
import React, { useEffect, useRef, useState } from "react";
import { useForm } from "react-hook-form";
import InputField from "../../components/customInputField";
import { ErrorMessage, SuccessMessage } from "../../components/infoText/index";
import { ENDPOINTS } from "../../config/defaults";
import useGlobalApi from "../../hooks/useGlobalApi";
import { usePickMaster } from "../../hooks/usePickMaster";
import { stopPropagationHandler } from "../../utils/utilities";
import signupSchema from "../../validation/signupSchema";
import { SignupFormProps, SignupProps } from "./types";

const Signup = ({ onLoginClick }: SignupProps) => {
  const { loading, error, fetchApi } = useGlobalApi();

  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const { pickMasterValue } = usePickMaster("gender");

  const {
    register,
    handleSubmit,
    formState: { errors },
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

  const [successMessage, setSuccessMessage] = useState<string>("");

  // handle submit
  const onSubmit = async (data: SignupFormProps) => {
    const payload = {
      ...data,
      dob: new Date(data.dob).toISOString(),
    };
    const response = await fetchApi("POST", ENDPOINTS.USER_SIGNUP, payload);
    if (!response) {
      return;
    }
    setSuccessMessage(response?.message);
    timerRef.current = setTimeout(() => {
      onLoginClick();
    }, 2000);
  };

  useEffect(() => {
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, []);

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
          <p className="input-field-error mt-1">Fields marked with * are required</p>
        </div>

        {successMessage ? <SuccessMessage text={successMessage} /> : <></>}
        {error ? <ErrorMessage text={error?.message} /> : <></>}

        <form className="space-y-4" onSubmit={handleSubmit(onSubmit)}>
          <div className="signup-form-layout">
            <div>
              <InputField label="First Name " required={true}>
                <input type="text" {...register("firstName")} className="signup-input-field" />
              </InputField>
              {errors.firstName && <p className="input-field-error">{errors.firstName?.message}</p>}
            </div>
            <div>
              <InputField label="Last Name">
                <input type="text" {...register("lastName")} className="signup-input-field" />
              </InputField>
            </div>
          </div>

          <div className="signup-form-layout">
            <div>
              <InputField label="Gender " required={true}>
                <div className="relative">
                  <select {...register("gender")} className="signup-input-field w-full">
                    <option value="">Select</option>

                    {pickMasterValue.map(item => (
                      <option key={item.id} value={item.value}>
                        {item.value}
                      </option>
                    ))}
                  </select>
                </div>
              </InputField>
              {errors.gender && <p className="input-field-error">{errors.gender?.message}</p>}
            </div>

            <div>
              <InputField label="Email " required={true}>
                <input type="text" {...register("email")} className="signup-input-field" />
              </InputField>
              {errors.email && <p className="input-field-error">{errors.email?.message}</p>}
            </div>
          </div>

          <div className="signup-form-layout">
            <div>
              <InputField label="Date of Birth " required={true}>
                <input
                  type="date"
                  {...register("dob")}
                  className="signup-input-field"
                  max={new Date().toISOString().split("T")[0]}
                  min="1900-01-01"
                />
              </InputField>
              {errors.dob && <p className="input-field-error">{errors.dob?.message}</p>}
            </div>
            <div>
              <InputField label="Contact Number " required={true}>
                <input type="text" {...register("contact")} className="signup-input-field" />
              </InputField>
              {errors.contact && <p className="input-field-error">{errors.contact?.message}</p>}
            </div>
          </div>

          <div className="signup-form-layout">
            <div>
              <InputField label="Address " required={true}>
                <input type="text" {...register("address")} className="signup-input-field" />
              </InputField>
              {errors.address && <p className="input-field-error">{errors.address?.message}</p>}
            </div>
            <div>
              <InputField label="Username " required={true}>
                <input type="text" {...register("userName")} className="signup-input-field" />
              </InputField>
              {errors.userName && <p className="input-field-error">{errors.userName?.message}</p>}
            </div>
          </div>

          <div className="signup-form-layout">
            <div>
              <InputField label="Password " required={true}>
                <input type="password" {...register("password")} className="signup-input-field" />
              </InputField>
              {errors.password && <p className="input-field-error">{errors.password?.message}</p>}
            </div>
            <div>
              <InputField label="Confirm Password " required={true}>
                <input
                  type="password"
                  {...register("confirmPassword")}
                  className="signup-input-field"
                />
              </InputField>
              {errors.confirmPassword && (
                <p className="input-field-error">{errors.confirmPassword?.message}</p>
              )}
            </div>
          </div>

          <button
            type="submit"
            className="w-full save-btn flex items-center justify-center"
            disabled={loading}
          >
            {loading ? (
              "Creating..."
            ) : (
              <>
                <User size={18} /> CREATE USER
              </>
            )}
          </button>
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

export default React.memo(Signup);
