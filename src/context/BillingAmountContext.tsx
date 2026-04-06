import { createContext, Dispatch, ReactNode, SetStateAction, useState } from "react";

type BillingAmountContextType = {
  totalBillingAmount: number;
  setTotalBillingAmount: Dispatch<SetStateAction<number>>;
  amount: number;
  setAmount: Dispatch<SetStateAction<number>>;
};

export const BillingAmountContext = createContext<BillingAmountContextType>({
  totalBillingAmount: 0,
  setTotalBillingAmount: () => {},
  amount: 0,
  setAmount: () => {},
});

export const BillingAmountProvider = ({ children }: { children: ReactNode }) => {
  const [totalBillingAmount, setTotalBillingAmount] = useState<number>(0);

  return (
    <BillingAmountContext.Provider
      value={{
        totalBillingAmount,
        setTotalBillingAmount,
        amount: totalBillingAmount,
        setAmount: setTotalBillingAmount,
      }}
    >
      {children}
    </BillingAmountContext.Provider>
  );
};
