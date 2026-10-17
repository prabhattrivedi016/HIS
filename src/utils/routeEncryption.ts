import CryptoJS from "crypto-js";

const SECRET_KEY = import.meta.env.VITE_ROUTE_SECRET_KEY as string;

export const encryptRouteId = (id: number | string): string => {
  if (!SECRET_KEY) {
    throw new Error("Route encryption key is missing");
  }

  const encrypted = CryptoJS.AES.encrypt(String(id), SECRET_KEY).toString();

  return encrypted.replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
};

export const decryptRouteId = (encryptedId: string): string | null => {
  try {
    if (!SECRET_KEY || !encryptedId) return null;

    const base64 = encryptedId.replace(/-/g, "+").replace(/_/g, "/");

    const paddedBase64 = base64 + "=".repeat((4 - (base64.length % 4)) % 4);

    const bytes = CryptoJS.AES.decrypt(paddedBase64, SECRET_KEY);

    const decrypted = bytes.toString(CryptoJS.enc.Utf8);

    // Reject invalid ciphertext or non-numeric IDs.
    if (!/^\d+$/.test(decrypted)) return null;

    return decrypted;
  } catch {
    return null;
  }
};
