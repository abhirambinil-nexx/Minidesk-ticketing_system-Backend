import jwt from "jsonwebtoken";
import crypto from "crypto";
import refreshTokenRepository from "../repositories/refreshToken.repository.js";
import redisClient from "../config/redis.js";

class TokenService {
  generateAccessToken(user) {
    return jwt.sign(
      {
        id: user.id,
        role: user.role,
        jti: crypto.randomUUID(), // unique ID per token
      },
      process.env.JWT_ACCESS_SECRET,
      { expiresIn: process.env.JWT_ACCESS_EXPIRES || "1h" },
    );
  }

  generateRefreshToken(user) {
    return jwt.sign({ id: user.id }, process.env.JWT_REFRESH_SECRET, {
      expiresIn: process.env.JWT_REFRESH_EXPIRES || "30d",
    });
  }

  verifyAccessToken(token) {
    return jwt.verify(token, process.env.JWT_ACCESS_SECRET);
  }

  verifyRefreshToken(token) {
    return jwt.verify(token, process.env.JWT_REFRESH_SECRET);
  }

  hashRefreshToken(token) {
    return crypto.createHash("sha256").update(token).digest("hex");
  }

  async saveRefreshToken(userId, refreshToken) {
    const tokenHash = this.hashRefreshToken(refreshToken);
    const decoded = this.verifyRefreshToken(refreshToken);
    await refreshTokenRepository.create({
      userId,
      tokenHash,
      expiresAt: new Date(decoded.exp * 1000),
    });
  }

  async revokeRefreshToken(refreshToken) {
    const tokenHash = this.hashRefreshToken(refreshToken);
    const token = await refreshTokenRepository.findByTokenHash(tokenHash);
    if (!token) return;
    await refreshTokenRepository.revoke(token.id);
  }

  async rotateRefreshToken(refreshToken, user) {
    await this.revokeRefreshToken(refreshToken);
    const newAccessToken = this.generateAccessToken(user);
    const newRefreshToken = this.generateRefreshToken(user);
    await this.saveRefreshToken(user.id, newRefreshToken);
    return { accessToken: newAccessToken, refreshToken: newRefreshToken };
  }

  // Blacklist an access token in Redis until it naturally expires
  async blacklistAccessToken(token) {
    const decoded = jwt.decode(token);
    if (!decoded?.jti || !decoded?.exp) return;

    const ttl = decoded.exp - Math.floor(Date.now() / 1000);
    if (ttl > 0) {
      await redisClient.set(`blacklist:${decoded.jti}`, "1", { EX: ttl });
    }
  }

  // Check if an access token is blacklisted
  async isBlacklisted(jti) {
    const result = await redisClient.get(`blacklist:${jti}`);
    return result !== null;
  }

  async logoutAll(userId) {
    await refreshTokenRepository.revokeAll(userId);
  }
}

export default new TokenService();
