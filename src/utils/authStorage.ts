export const getAuthStorage = () => {
  const hasLocalAuth = !!(localStorage.getItem("auth") || localStorage.getItem("accessToken"));
  const hasSessionAuth = !!(sessionStorage.getItem("auth") || sessionStorage.getItem("accessToken"));

  if (hasLocalAuth) return localStorage;
  if (hasSessionAuth) return sessionStorage;

  return localStorage;
};
