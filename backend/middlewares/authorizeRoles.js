const authorizeRoles = (...allowedRoles) => {
    return (req, res, next) => {
        if (!req.role) {
            return res.status(401).json({
                success: false,
                message: "User role not found",
            });
        }

        if (!allowedRoles.includes(req.role)) {
            return res.status(403).json({
                success: false,
                message: "You are not authorized to perform this action",
            });
        }

        next();
    };
};

export default authorizeRoles;
