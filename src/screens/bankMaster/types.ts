type BankItem = {
  bankId: number;
  bankName: string;
  isActive: number;
  createdBy: string;
  createdOn: string;
  lastModifiedBy: string;
  lastModifiedOn: string;
};

type BankDetailsListItem = {
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

export type { BankDetailsListItem, BankItem };
