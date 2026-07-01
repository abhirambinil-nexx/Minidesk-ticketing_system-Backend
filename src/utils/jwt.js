import jwt from "jsonwebtoken";
import crypto from "crypto";

export const generateToken = (user) => {
  return jwt.sign(
    {
      id: user.id,
      role: user.role,
      jti: crypto.randomUUID(),
    },
    process.env.JWT_SECRET,
    { expiresIn: "1d" },
  );
};
