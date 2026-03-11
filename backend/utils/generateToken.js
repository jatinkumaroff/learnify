import { signAuthToken } from "./token.js";

export const generateToken = async (res, user, message) => {
  const token = await signAuthToken(user._id, user.role);
  return res
    .status(200)
    .cookie("token", token, {
      httpOnly: true,
      // SameSite=None + Secure=true is required for cross-domain cookies.
      // Frontend (learnify-six-puce.vercel.app) and backend
      // (learnify-backend-sandy.vercel.app) are different domains, so
      // SameSite=Strict/Lax causes the browser to silently drop the cookie,
      // making every authenticated request return 401.
      sameSite: "none",
      secure: true,
      maxAge: 24 * 60 * 60 * 1000, // 1 day
    })
    .json({
      success: true,
      message,
      user,
    });
};