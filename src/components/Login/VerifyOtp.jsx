import React from "react";
import Button from "../Atomic/Button";
import InputField from "../Atomic/InputField";

const VerifyOtp = ({ onClose }) => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center  bg-black\50 backdrop-blur-sm cursor-pointer">
      <div className="bg-white border border-gray-500 h-80 w-120 rounded-xl">
        <div className="flex justify-end">
          <button
            onClick={onClose}
            className="text-gray-600 hover:text-black text-xl font-bold p-2"
          >
            {" "}
            X
          </button>
        </div>
        <button className="border border-gray-500 p-2 m-4 bg-blue-500 hover:text-white">
          Verify Mobile
        </button>
        <br />
        <button className="border border-gray-500 p-2 m-4 bg-blue-500 hover:text-white">
          Verify Otp
        </button>
      </div>
    </div>
  );
};

export default VerifyOtp;
