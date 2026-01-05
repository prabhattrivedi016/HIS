export const getAuthStorage = () => {
  return localStorage.getItem("accessToken") ? localStorage : sessionStorage;
};
