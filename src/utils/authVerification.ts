type VerifiableUser = {
  isContactVerified?: unknown;
  isEmailVerified?: unknown;
  IsContactVerified?: unknown;
  IsEmailVerified?: unknown;
} | null | undefined;

export const isVerifiedFlag = (value: unknown): boolean => {
  if (value === true || value === 1) return true;
  if (typeof value === "string") {
    const normalized = value.trim().toLowerCase();
    return normalized === "1" || normalized === "true" || normalized === "yes";
  }
  return false;
};

export const isAccountFullyVerified = (user: VerifiableUser): boolean => {
  if (!user) return false;

  const isContactVerified = isVerifiedFlag(
    user.isContactVerified ?? user.IsContactVerified
  );
  const isEmailVerified = isVerifiedFlag(user.isEmailVerified ?? user.IsEmailVerified);

  return isContactVerified && isEmailVerified;
};

export const getVerificationFlags = (user: VerifiableUser) => ({
  isContactVerified: isVerifiedFlag(user?.isContactVerified ?? user?.IsContactVerified),
  isEmailVerified: isVerifiedFlag(user?.isEmailVerified ?? user?.IsEmailVerified),
});
