import Swal from "sweetalert2";

export const showError = (message?: string) => {
  Swal.fire({
    title: "Error! Please  try later!",
    text: message ?? "Something went wrong",
    icon: "error",
    confirmButtonText: "OK",
  });
};

export const showSuccess = (message?: string) => {
  Swal.fire({
    position: "top",
    title: message ?? "Data saved successfully",
    icon: "success",
    timer: 1000,
    showConfirmButton: false,
  });
};
