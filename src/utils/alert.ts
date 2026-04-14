import { toast, ToastOptions } from "react-toastify";

const baseToastOptions: ToastOptions = {
  position: "top-center",
  autoClose: 1500,
  hideProgressBar: false,
  closeOnClick: true,
  pauseOnHover: true,
  draggable: true,
};

export const showError = (message?: string) => {
  toast.error(message ?? "Something went wrong", {
    ...baseToastOptions,
    autoClose: 1500,
  });
};

export const showSuccess = (message?: string) => {
  toast.success(message ?? "Data saved successfully", baseToastOptions);
};

export const showInfo = (message?: string) => {
  toast.info(message ?? "Information", baseToastOptions);
};

export const showWarning = (message?: string) => {
  toast.warning(message ?? "Please check this", {
    ...baseToastOptions,
    autoClose: 1500,
  });
};
