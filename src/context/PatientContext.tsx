import { PatientDataItem } from "@/screens/patientRegistration/types";
import { createContext, ReactNode, useContext, useState } from "react";

type PatientContextType = {
  searchedPatientData: PatientDataItem | null;
  setSearchedPatientData: React.Dispatch<React.SetStateAction<PatientDataItem | null>>;
};

export const PatientContext = createContext<PatientContextType | null>(null);

export const PatientProvider = ({ children }: { children: ReactNode }) => {
  const [searchedPatientData, setSearchedPatientData] = useState<PatientDataItem | null>(null);

  return (
    <PatientContext.Provider value={{ searchedPatientData, setSearchedPatientData }}>
      {children}
    </PatientContext.Provider>
  );
};

export const usePatientContext = () => {
  const context = useContext(PatientContext);
  if (!context) {
    throw new Error("usePatientContext must be used within a PatientProvider");
  }
  return context;
};
