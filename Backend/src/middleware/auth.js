import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET || "super-secret-jwt-key-change-this-in-production";

export function authenticateJWT(req, res, next) {
  const authHeader = req.headers.authorization;
  let token = null;

  if (authHeader && authHeader.startsWith("Bearer ")) {
    token = authHeader.split(" ")[1];
  } else if (req.query && req.query.token) {
    token = req.query.token;
  }

  if (!token) {
    return res.status(401).json({ success: false, error: { code: "UNAUTHORIZED", message: "Missing authorization token" } });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded;
    next();
  } catch (error) {
    return res.status(401).json({ success: false, error: { code: "UNAUTHORIZED", message: "Unauthorized or expired token" } });
  }
}

export function authorizeRoles(roles) {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ success: false, error: { code: "UNAUTHORIZED", message: "User is unauthenticated" } });
    }
    
    const userRole = req.user.role;
    const isAllowed = roles.includes(userRole) || 
                      (["admin", "client-admin", "super-admin"].includes(userRole) && (roles.includes("admin") || roles.includes("sales-manager") || roles.includes("sales-executive")));

    if (!isAllowed) {
      return res.status(403).json({ success: false, error: { code: "FORBIDDEN", message: `Access denied: insufficient permission level (${userRole})` } });
    }
    next();
  };
}
