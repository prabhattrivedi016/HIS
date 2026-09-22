export const ABDM_ENDPOINTS = {
  LOGIN_REQUEST_OTP: "/api/v1/abha/login/otp",
  LOGIN_REQUEST_OTP_MOBILE_ACCOUNT: "/api/v1/abha/login/otp/mobile-account",
  LOGIN_VERIFY_OTP: "/api/v1/abha/login/otp/verify",

  SEARCH_BY_MOBILE: "/api/v1/abha/search/by-mobile",
  SEARCH_BY_ABHA_ADDRESS: "/api/v1/abha/search/by-abha-address",

  PROFILE: "/api/v1/abha/profile",
  PROFILE_BY_ABHA_ID: "/api/v1/abha/profile/by-abha-id",
  PROFILE_CARD: "/api/v1/abha/profile/card",
  PROFILE_CARD_BY_ABHA_ID: "/api/v1/abha/profile/by-abha-id/card",

  ENROLLMENT_AADHAAR_OTP: "/api/v1/abha/enrollment/aadhaar/otp",
  ENROLLMENT_AADHAAR_VERIFY: "/api/v1/abha/enrollment/aadhaar/verify",
  ENROLLMENT_MOBILE_CHECK_AND_GENERATE_OTP: "/api/v1/abha/enrollment/mobile/check-and-generate-otp",
  ENROLLMENT_MOBILE_VERIFY: "/api/v1/abha/enrollment/mobile/verify",
  ENROLLMENT_PHR_SUGGESTIONS: "/api/v1/abha/enrollment/phr/suggestions",
  ENROLLMENT_PHR_ADDRESS: "/api/v1/abha/enrollment/phr/address",
} as const;
