import { SignJWT, jwtVerify } from "jose";

const textEncoder = new TextEncoder();
const jwtSecret = textEncoder.encode("learnify_local_dev_secret");

export const signAuthToken = async (userId, role) => {
  return new SignJWT({ userId: String(userId), role })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("1d")
    .sign(jwtSecret);
};

export const verifyAuthToken = async (token) => {
  const { payload } = await jwtVerify(token, jwtSecret);
  return payload;
};
