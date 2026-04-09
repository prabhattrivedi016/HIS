import Swal from "sweetalert2";
export const showError = (message?: string) => {
  Swal.fire({
    title: "Error! Please try later!",
    html: `<span style="color: red; font-weight: 500;">
            ${message ?? "Something went wrong"}
          </span>`,
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
