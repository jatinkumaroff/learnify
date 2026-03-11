import { SignJWT, jwtVerify } from "jose";

// MUST match the JWT_SECRET env var on Vercel.
// Tokens signed with a different secret cannot be verified — every
// authenticated request returns 401 even with a valid cookie.
const getSecret = () => {
  const secret = process.env.JWT_SECRET || "learnify_local_dev_secret";
  return new TextEncoder().encode(secret);
};

export const signAuthToken = async (userId, role) => {
  return new SignJWT({ userId: String(userId), role })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("1d")
    .sign(getSecret());
};

export const verifyAuthToken = async (token) => {
  const { payload } = await jwtVerify(token, getSecret());
  return payload;
};