type BankItem = {
  bankId: number;
  bankName: string;
  isActive: string;
  createdBy: string;
  createdOn: string;
  lastModifiedBy: string;
  lastModifiedOn: string;
};

type BankDetailsList = {
  id: number;
  payeeName: string;
  panNumber: string;
  bankName: string;
  bankAccountNumber: string;
  bankAddress: string;
  ifscCode: string;
  pinCode: string;
  tinNumber: string;
  isActive: number;
  createdBy: string;
  createdOn: string;
  lastModifiedBy: string;
  lastModifiedOn: string;
};

export type { BankDetailsList, BankItem };
