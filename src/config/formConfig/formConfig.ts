type FormConfig = {
  type:
    | "heading"
    | "requiredErrorMessage"
    | "text"
    | "select"
    | "date"
    | "email"
    | "textArea"
    | "password"
    | "button";
  label: string;
  fieldId?: string;
  required?: boolean;
  readonly?: boolean;
  validation?: RegExp | string;
  minLength?: number;
  maxLength?: number;
  minDate?: string;
  maxDate?: string;
  placeholder?: string;
  employeeID?: string;
  status?: string;
  action?: string;
};

// {
//   "userId": 0,
// "isActive": 0, select
// "employeeID": "string", input field
// "reportToUserId": 0 select from api
// }

export const formConfig: FormConfig[] = [
  { type: "heading", label: "Create New User" },
  { type: "requiredErrorMessage", label: "Fields marked with * are required" },
  {
    type: "text",
    label: "First Name",
    fieldId: "firstName",
    required: true,
    placeholder: "Enter First Name",
    validation: "^[a-zA-Z]+$",
    readonly: false,
  },
  {
    type: "text",
    label: "Middle Name",
    fieldId: "middleName",
    placeholder: "Enter Middle Name",
    required: false,
    validation: "^[a-zA-Z]+$",
    readonly: false,
  },
  {
    type: "text",
    label: "Last Name",
    fieldId: "lastName",
    placeholder: "Enter Last Name",
    required: false,
    validation: "^[a-zA-Z]+$",
    readonly: false,
  },
  {
    type: "select",
    label: "Gender",
    fieldId: "gender",
    required: true,
    readonly: false,
  },

  {
    type: "date",
    label: "Date of Birth",
    fieldId: "dob",
    placeholder: "Enter Date of Birth",
    required: true,
    minDate: "2000-01-01",
    maxDate: new Date().toISOString().split("T")[0],
    readonly: false,
  },
  {
    type: "email",
    label: "Email",
    fieldId: "email",
    placeholder: "Enter email address",
    required: true,
    validation: "^[^\\s@]+@[^\\s@]+\\.[^\\s@]+$",
    readonly: false,
  },
  {
    type: "text",
    label: "Contact",
    fieldId: "contact",
    placeholder: "Enter contact details",
    required: true,
    validation: "^[0-9]{10}$",
    minLength: 10,
    maxLength: 10,
    readonly: false,
  },
  {
    type: "textArea",
    label: "Address",
    fieldId: "address",
    placeholder: "Enter address details",
    required: false,
    maxLength: 500,
    readonly: false,
  },
  {
    type: "text",
    label: "User Name",
    fieldId: "userName",
    placeholder: "Enter User Name",
    required: true,
    readonly: false,
  },
  {
    type: "select",
    label: "Status",
    fieldId: "isActive",
    placeholder: "Select Status",
    required: false,
    readonly: false,
  },
  {
    type: "text",
    label: "Employee ID",
    fieldId: "employeeID",
    placeholder: "Enter Employee ID",
    required: false,
    readonly: false,
  },
  {
    type: "select",
    label: "Report to User",
    fieldId: "reportToUserId",
    placeholder: "Report to User",
    required: true,
    readonly: false,
  },
  {
    type: "select",
    label: " Department ",
    fieldId: "userDepartmentId",
    placeholder: "Enter User Department ID",
    required: false,
    readonly: false,
  },
  {
    type: "password",
    label: "Password",
    fieldId: "password",
    placeholder: "Enter password",
    required: true,
    validation: "^(?=.*[A-Z])(?=.*[!@#$%^&*])(?=.{6,15}$)",
    minLength: 6,
    maxLength: 15,
    readonly: false,
  },

  {
    type: "password",
    label: "Confirm Password",
    fieldId: "confirmPassword",
    placeholder: "Enter confirm password",
    required: true,
    validation: "^(?=.*[A-Z])(?=.*[!@#$%^&*])(?=.{6,15}$)",
    readonly: false,
  },

  {
    type: "button",
    label: "Submit",
    action: "handleSubmitButton",
  },
];
