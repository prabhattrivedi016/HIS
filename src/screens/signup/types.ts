type SignupFormProps = {
  confirmPassword: string;
  password: string;
  userName: string;
  address: string;
  contact: string;
  dob: string;
  email: string;
  gender: string;
  lastName: string;
  middleName: string;
  firstName: string;
};

interface SignupProps {
  onLoginClick: () => void;
}

export type { SignupFormProps, SignupProps };
