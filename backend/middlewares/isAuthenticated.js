import { verifyAuthToken } from "../utils/token.js";

const isAuthenticated = async (req, res, next) => {
  try {
    const token = req.cookies.token;
    if (!token) {
      return res.status(401).json({
        message: "User not Authenticated",
        success: false,
      });
    }
    const decode = await verifyAuthToken(token);
    if (!decode) {
      return res.status(401).json({
        message: "invalid token",
        success: false,
      });
    }
    req.id = decode.userId;
    req.role = decode.role;
    next();
  } catch (error) {
    console.log(error);
    return res.status(401).json({
      message: "Invalid or expired token",
      success: false,
    });
  }
};
export default isAuthenticated;
