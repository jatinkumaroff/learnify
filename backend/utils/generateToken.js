import { signAuthToken } from "./token.js";

export const generateToken = async (res, user, message) => {
    const token = await signAuthToken(user._id);
    return res.status(200).cookie("token", token, { httpOnly: true, sameSite: "strict", maxAge: 24 * 60 * 60 * 1000 }).json({
        success:true,
        message,
        user
    });
};
