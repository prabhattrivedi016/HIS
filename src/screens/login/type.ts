import { Dispatch, SetStateAction } from "react";

interface Branch {
  branchId: number;
  branchName: string;
}

interface BranchListResponse {
  data: Branch[];
  message: string;
  result: boolean;
}

type LoginFormData = {
  selectedBranchId: number | "";
  userName: string;
  password: string;
  rememberMe?: boolean;
};

type InputError = {
  userName?: string;
  password?: string;
  branch?: string;
};

interface TabItem {
  tabId: number;
  tabName: string;
  iconClass: string;
}

interface PageItem {
  subMenuId: number;
  subMenuName: string;
  url: string;
  tabId: number;
}

type VerifyOtpProps = {
  userId: number | null;
  userName: string;
  contact: string;
  email: string;

  isContact: boolean | null;
  isEmail: boolean | null;

  setIsContact: Dispatch<SetStateAction<boolean | null>>;
  setIsEmail: Dispatch<SetStateAction<boolean | null>>;

  onClose: () => void;
};

type EmailProps = {
  userId: number | null;
  userName: string;
  email: string;
  onVerified: () => void;
  isEmail: boolean | null;
};

type MobileProps = {
  userId: number | null;
  userName: string;
  contact: string;
  onVerified: () => void;
  isContact: boolean | null;
};

interface ForgotPasswordProps {
  onClose: () => void;
}

type ResendButtonProps = {
  onResend: () => void;
};

export type {
  Branch,
  BranchListResponse,
  EmailProps,
  ForgotPasswordProps,
  InputError,
  LoginFormData,
  MobileProps,
  PageItem,
  ResendButtonProps,
  TabItem,
  VerifyOtpProps,
};
