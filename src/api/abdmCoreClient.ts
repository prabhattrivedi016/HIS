import axios from "axios";
const ABDM_CORE_BASE_URL = import.meta.env.VITE_ABDM_CORE_BASE_URL || "https://localhost:7030";
const ABDM_CORE_CLIENT_ID =
  import.meta.env.VITE_ABDM_CORE_CLIENT_ID || "dbd43236-2d81-463c-9252-2d0755287415";
const ABDM_CORE_SECRET_KEY =
  import.meta.env.VITE_ABDM_CORE_SECRET_KEY || "mqqUvOmj5A3IbUIGpVS2kgrkcLaTNx3FRUA9pIi5ya8=";

const abdmCoreClient = axios.create({
  baseURL: ABDM_CORE_BASE_URL,
});

const textEncoder = new TextEncoder();

const toBase64 = (bytes: ArrayBuffer): string => {
  let binary = "";
  const view = new Uint8Array(bytes);
  for (let i = 0; i < view.length; i++) binary += String.fromCharCode(view[i]);
  return btoa(binary);
};

const sha256Base64 = async (text: string): Promise<string> => {
  const digest = await crypto.subtle.digest("SHA-256", textEncoder.encode(text));
  return toBase64(digest);
};

const hmacSha256Base64 = async (secret: string, payload: string): Promise<string> => {
  const key = await crypto.subtle.importKey(
    "raw",
    textEncoder.encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"]
  );
  const signature = await crypto.subtle.sign("HMAC", key, textEncoder.encode(payload));
  return toBase64(signature);
};

abdmCoreClient.interceptors.request.use(async config => {
  const method = (config.method ?? "get").toUpperCase();

  const path = (config.url ?? "").split("?")[0];

  const timestamp = new Date().toISOString();
  const nonce = crypto.randomUUID();

  const bodyString =
    config.data === undefined || config.data === null || config.data === ""
      ? ""
      : typeof config.data === "string"
        ? config.data
        : JSON.stringify(config.data);

  if (bodyString) {
    config.data = bodyString;
    config.headers.set("Content-Type", "application/json");
  }

  const bodyHash = await sha256Base64(bodyString);
  const payload = [method, path, timestamp, nonce, bodyHash].join("\n");
  const signature = await hmacSha256Base64(ABDM_CORE_SECRET_KEY, payload);

  config.headers.set("X-Client-Id", ABDM_CORE_CLIENT_ID);
  config.headers.set("X-Timestamp", timestamp);
  config.headers.set("X-Nonce", nonce);
  config.headers.set("X-Signature", signature);

  return config;
});

export default abdmCoreClient;
