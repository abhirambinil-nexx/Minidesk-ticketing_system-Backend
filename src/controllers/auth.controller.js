import { signup, login } from "../services/auth.service.js";
import { signupSchema, loginSchema } from "../validators/auth.validator.js";
import tokenService from "../services/token.service.js";

function setRefreshCookie(res, refreshToken) {
  res.cookie("refreshToken", refreshToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    maxAge: 30 * 24 * 60 * 60 * 1000,
  });
}

export const signupUser = async (req, res) => {
  try {
    const data = signupSchema.parse(req.body);
    const result = await signup(data);
    setRefreshCookie(res, result.refreshToken);
    return res.status(201).json({
      accessToken: result.accessToken,
      user: result.user,
    });
  } catch (error) {
    if (error.issues) {
      return res.status(400).json({ message: error.issues[0].message });
    }
    return res.status(400).json({ message: error.message });
  }
};

export const loginUser = async (req, res) => {
  try {
    const data = loginSchema.parse(req.body);
    const result = await login(data);
    setRefreshCookie(res, result.refreshToken);
    return res.status(200).json({
      accessToken: result.accessToken,
      user: result.user,
    });
  } catch (error) {
    if (error.issues) {
      return res.status(400).json({ message: error.issues[0].message });
    }
    return res.status(400).json({ message: error.message });
  }
};

export const refreshToken = async (req, res) => {
  try {
    const { refreshToken } = req.cookies;

    if (!refreshToken) {
      return res.status(401).json({ message: "No refresh token provided. Please log in again." });
    }

    const decoded = tokenService.verifyRefreshToken(refreshToken);

    const tokens = await tokenService.rotateRefreshToken(refreshToken, {
      id: decoded.id,
      role: decoded.role,
    });

    setRefreshCookie(res, tokens.refreshToken);
    return res.status(200).json({ accessToken: tokens.accessToken });
  } catch (error) {
    console.error("Refresh Token Error:", error.message);
    res.clearCookie("refreshToken");
    return res.status(403).json({ message: "Invalid or expired refresh token. Please log in again." });
  }
};

export const logoutUser = async (req, res) => {
  try {
    const { refreshToken } = req.cookies;

    if (refreshToken) {
      await tokenService.revokeRefreshToken(refreshToken);
    }

    const authHeader = req.headers.authorization;
    if (authHeader?.startsWith("Bearer ")) {
      const accessToken = authHeader.split(" ")[1];
      await tokenService.blacklistAccessToken(accessToken);
    }

    res.clearCookie("refreshToken", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
    });

    return res.status(200).json({ message: "Logged out successfully." });
  } catch (error) {
    console.error("Logout Error:", error.message);
    return res.status(500).json({ message: "An error occurred during logout." });
  }
};