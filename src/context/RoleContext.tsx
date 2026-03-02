import { getAuthStorage } from "@/utils/authStorage";
import { createContext, ReactNode, useEffect, useState } from "react";

type RoleContextType = {
  roleName: string | null;
  roleId: number | null;
  setRole: (roleName: string, roleId: number) => void;
  clearRole: () => void;
};

export const RoleContext = createContext<RoleContextType | null>(null);

type RoleProviderProps = {
  children: ReactNode;
};

export const RoleProvider = ({ children }: RoleProviderProps) => {
  const [roleName, setRoleName] = useState<string | null>(null);
  const [roleId, setRoleId] = useState<number | null>(null);

  const setRole = (roleName: string, roleId: number) => {
    setRoleName(roleName);
    setRoleId(roleId);
  };

  //   read role details on page load from storage and set in context
  useEffect(() => {
    const storage = getAuthStorage();
    const storedRole = storage.getItem("role");

    if (storedRole) {
      const parsedRole = JSON.parse(storedRole);
      setRole(parsedRole.roleName, parsedRole.roleId);
    }
  }, []);

  const clearRole = () => {
    const storage = getAuthStorage();
    storage.removeItem("role");
    setRoleName(null);
    setRoleId(null);
  };

  return (
    <RoleContext.Provider value={{ roleName, roleId, setRole, clearRole }}>
      {children}
    </RoleContext.Provider>
  );
};
