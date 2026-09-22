export const LoginIdentifierType = {
  Aadhaar: 1,
  Mobile: 2,
  AbhaNumber: 3,
  AbhaAddress: 4,
} as const;

export const LoginAuthMethod = {
  AadhaarOtp: 1,
  MobileOtp: 2,
} as const;

export interface AbdmCallResult<T> {
  result: boolean;
  message?: string | null;
  data?: T | null;
  statusCode?: number | null;
}

export interface OtpRequestResultDto {
  result: boolean;
  txnId?: string | null;
  message?: string | null;
}

export interface OtpVerifyResultDto {
  result: boolean;
  authResult?: string | null;
  token?: string | null;
  refreshToken?: string | null;
  txnId?: string | null;
  message?: string | null;
  raw?: unknown;
}

export interface AbhaAccountDto {
  message?: string | null;
  txnId?: string | null;
  token?: string | null;
  refreshToken?: string | null;
  isNew: boolean;
  healthIdNumber?: string | null;
  healthId?: string | null;
  name?: string | null;
  firstName?: string | null;
  middleName?: string | null;
  lastName?: string | null;
  gender?: string | null;
  mobile?: string | null;
  raw?: unknown;
}

/**
 * ABDM's real phr/web/login/abha/search response, passed straight through by
 * ABDMCore's AbhaSearchService.SearchByAbhaAddressAsync -- confirmed against
 * GWS.ABDM.APIUtility/SearchABHA.cs's AbhaAddressSearchResponse/AbhaAddressSearchResult.
 * On a 404/not-found, ABDMCore's invoker surfaces the error via AbdmCallResult.message
 * instead (result:false), so this shape only describes the found case.
 */
export interface AbhaAddressSearchResult {
  healthIdNumber?: string | null;
  abhaAddress?: string | null;
  authMethods?: string[] | null;
  blockedAuthMethods?: string[] | null;
  status?: string | null;
  message?: string | null;
  fullName?: string | null;
  mobile?: string | null;
}

/**
 * One ABHA account linked to a searched mobile number -- confirmed against
 * GWS.ABDM.APIUtility/SearchABHA.cs's searchABHAByMobile and the
 * $searchABHAByMobileForVerify JS in _ABHACreationVerificationView.cshtml, which reads
 * d[0].ABHA[].{index,name,ABHANumber,gender} to build the account-picker table.
 */
export interface MobileSearchAccount {
  // ABDM's real profile/account/abha/search response sends this as a JSON number, not a
  // string -- confirmed from a live 400 ("$.index") when the raw number was forwarded
  // straight to the request-otp call, whose Index field is a C# string. Always normalize to
  // string with String(a.index) before using it (see searchAbhaByMobile in VerifyAbhaModal).
  index: string | number;
  name?: string | null;
  ABHANumber?: string | null;
  gender?: string | null;
}

/**
 * ABDM's real profile/account/abha/search response is an array with a single element
 * carrying the search txnId and the matched accounts -- mirrors the legacy JS's
 * d[0].txnId / d[0].ABHA indexing exactly (not an object at the top level).
 */
export interface MobileSearchResult {
  txnId: string;
  ABHA: MobileSearchAccount[];
  message?: string | null;
}

export interface PhrSuggestionsResultDto {
  result: boolean;
  txnId?: string | null;
  abhaAddressList: string[];
  message?: string | null;
}

export interface AbdmProfile {
  ABHANumber?: string;
  abhaNumber?: string;
  preferredAbhaAddress?: string;
  abhaAddress?: string;
  healthId?: string;
  phrAddress?: string | string[];
  name?: string;
  firstName?: string;
  middleName?: string;
  lastName?: string;
  gender?: string;
  dob?: string;
  dayOfBirth?: string | number;
  monthOfBirth?: string | number;
  yearOfBirth?: string | number;
  mobile?: string;
  email?: string;
  address?: string;
  stateName?: string;
  districtName?: string;
  pincode?: string;
  pinCode?: string;
  photo?: string;
  kycPhoto?: string;
  profilePhoto?: string;
  [key: string]: unknown;
}
