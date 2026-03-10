// backend/middlewares/auth.js
// Simple dev/test auth middleware — NO JWT, NO secret required.
// Usage:
//  - For quick testing: send header `x-user-id: <mongodb_user_id>`
//  - Or set TEST_USER_ID in your .env (use a valid user _id from your DB)

export const authenticate = async (req, res, next) => {
  try {
    // Priority 1: x-user-id header (explicit)
    const headerUserId = req.headers["x-user-id"] || req.headers["X-User-Id"];
    if (headerUserId) {
      req.id = headerUserId.toString();
      return next();
    }

    // Priority 2: TEST_USER_ID env var (convenience for local dev)
    if (process.env.TEST_USER_ID) {
      req.id = process.env.TEST_USER_ID.toString();
      return next();
    }

    // If neither provided, block and explain what to do
    return res.status(401).json({
      message:
        "Unauthenticated. For local testing either:\n" +
        "1) Send HTTP header `x-user-id: <user_id>` with the request, OR\n" +
        "2) Set TEST_USER_ID in your .env to a valid user _id and restart the server.",
    });
  } catch (err) {
    console.error("authenticate middleware error:", err);
    return res.status(500).json({ message: "Authentication middleware error" });
  }
};