import React from "react";
import Input from "../Atomic/Input";
import { User } from "lucide-react";

const BranchMaster = () => {
  return (
    <div className="p-6 bg-gray-50 rounded-xl shadow-md min-h-screen">
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
        <Input icon={User} type="text" placeholder="User ID" />
        <Input icon={User} type="text" placeholder="User ID" />
        <Input icon={User} type="text" placeholder="User ID" />
        <Input icon={User} type="text" placeholder="User ID" />
        <Input icon={User} type="text" placeholder="User ID" />
        <Input icon={User} type="text" placeholder="User ID" />
        <Input icon={User} type="text" placeholder="User ID" />
        <Input icon={User} type="text" placeholder="User ID" />
        <Input icon={User} type="text" placeholder="User ID" />
        <Input icon={User} type="text" placeholder="User ID" />
        <Input icon={User} type="text" placeholder="User ID" />
      </div>
    </div>
  );
};

export default BranchMaster;
