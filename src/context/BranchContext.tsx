import { createContext, ReactNode, useState } from "react";

interface BranchContextType {
  branchId: number;
  setBranchId: (branchId: number) => void;
}
export const BranchContext = createContext<BranchContextType>({
  branchId: 1,
  setBranchId: () => {},
});

export const BranchProvider = ({ children }: { children: ReactNode }) => {
  const [branchId, setBranchIdState] = useState<number>(() => {
    const stored =
      localStorage.getItem("selectedBranchId") || sessionStorage.getItem("selectedBranchId");
    return stored ? Number(stored) : 1;
  });

  const setBranchId = (id: number) => {
    setBranchIdState(id);
    localStorage.setItem("selectedBranchId", String(id));
    sessionStorage.setItem("selectedBranchId", String(id));
  };

  return (
    <BranchContext.Provider value={{ branchId, setBranchId }}>{children}</BranchContext.Provider>
  );
};
