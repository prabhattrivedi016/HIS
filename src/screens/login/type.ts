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

export type { Branch, BranchListResponse, LoginFormData };
