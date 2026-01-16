export const VIEWTYPE = {
  GRID: "grid",
  LIST: "list",
};

export enum HeaderFooterTabName {
  HEADER = "Header-Footer",
  FOOTER = "Sequence Mapping",
  DOCTOR = "Doctor Signature",
}

export enum BranchId {
  DEFAULT = 1,
}

export enum Status {
  ACTIVE = 1,
  INACTIVE = 0,
}

export enum DefaultRoleHeaderFooterMaster {
  DEFAULT = 0,
  DEFAULT_NAME = "Default",
}

export const FILE_UPLOAD_RULES = {
  MAX_FILE_SIZE: 2 * 1024 * 1024, // 2MB
  ALLOWED_TYPES: ["image/png", "image/jpeg", "image/jpg"],
} as const;
