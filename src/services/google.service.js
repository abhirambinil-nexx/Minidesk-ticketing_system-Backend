import { OAuth2Client } from "google-auth-library";
import crypto from "crypto";
import bcrypt from "bcrypt";
import userRepository from "../repositories/user.repository.js";
import tokenService from "./token.service.js";
import { hashEmail, encryptEmail } from "../utils/crypto.js";

const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

class GoogleService {
  /**
   * Handles the Google OAuth login/signup flow
   * @param {string} idToken - The JWT received from Google frontend login
   * @returns {Object} - Contains the user object and generated auth tokens
   */
  async authenticateWithGoogle(idToken) {
    // 1. Verify the Google token
    const ticket = await client.verifyIdToken({
      idToken,
      audience: process.env.GOOGLE_CLIENT_ID,
    });

    const payload = ticket.getPayload();
    const { email, name } = payload;

    if (!email) {
      throw new Error("Google authentication failed: No email provided.");
    }

    // 2. Hash email to lookup existing user (following the new security architecture)
    const emailHash = hashEmail(email);
    let user = await userRepository.findByEmailHash(emailHash);

    // 3. If user doesn't exist, register them automatically
    if (!user) {
      const emailCipher = encryptEmail(email);

      // Generate a random secure password since standard schema requires it,
      // even though OAuth users won't use it to log in.
      const randomPassword = crypto.randomBytes(20).toString("hex");
      const passwordHash = await bcrypt.hash(randomPassword, 10);

      user = await userRepository.create({
        name: name || "Google User",
        email_hash: emailHash,
        email_cipher: emailCipher,
        password: passwordHash,
        role: "requester", // Default role for new signups
        isActive: true,
      });
    }

    // 4. Prevent deactivated users from logging in
    if (!user.isActive) {
      throw new Error("Account deactivated. Please contact an administrator.");
    }

    // 5. Generate Access and Refresh Tokens using the completed TokenService
    const accessToken = tokenService.generateAccessToken(user);
    const refreshToken = tokenService.generateRefreshToken(user);

    await tokenService.saveRefreshToken(user.id, refreshToken);

    return {
      user,
      tokens: {
        accessToken,
        refreshToken,
      },
    };
  }
}

export default new GoogleService();
