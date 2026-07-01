import jwt from "jsonwebtoken";
import User from "../models/User.js";
import tokenService from "../services/token.service.js";

export const authenticate = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({ message: "Access token required" });
    }

    const token = authHeader.split(" ")[1];

    let decoded;
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET);
    } catch {
      decoded = jwt.verify(token, process.env.JWT_ACCESS_SECRET);
    }

    // Check blacklist — reject if token was logged out
    if (decoded.jti) {
      const blacklisted = await tokenService.isBlacklisted(decoded.jti);
      if (blacklisted) {
        return res
          .status(401)
          .json({ message: "Token has been revoked. Please log in again." });
      }
    }

    const user = await User.findByPk(decoded.id, {
      attributes: { exclude: ["password"] },
    });

    if (!user) {
      return res.status(401).json({ message: "User not found" });
    }

    req.user = user;
    next();
  } catch (error) {
    return res.status(401).json({ message: "Invalid or expired token" });
  }
};
