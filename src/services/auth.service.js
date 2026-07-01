import bcrypt from "bcrypt";
import {
  createUser,
  findUserByEmailHash,
} from "../repositories/auth.repository.js";
import { encryptEmail, decryptEmail, hashEmail } from "../utils/crypto.js";
import tokenService from "./token.service.js";

export const signup = async ({ name, email, password }) => {
  const emailHash = hashEmail(email);

  const existingUser = await findUserByEmailHash(emailHash);
  if (existingUser) throw new Error("Email already exists");

  const encryptedEmail = encryptEmail(email);
  const hashedPassword = await bcrypt.hash(password, 10);

  const user = await createUser({
    name,
    email_hash: emailHash,
    email_cipher: encryptedEmail,
    password: hashedPassword,
  });

  const accessToken = tokenService.generateAccessToken(user);
  const refreshToken = tokenService.generateRefreshToken(user);
  await tokenService.saveRefreshToken(user.id, refreshToken);

  return {
    accessToken,
    refreshToken,
    user: {
      id: user.id,
      name: user.name,
      email: decryptEmail(user.email_cipher),
      role: user.role,
    },
  };
};

export const login = async ({ email, password }) => {
  const emailHash = hashEmail(email);

  const user = await findUserByEmailHash(emailHash);
  if (!user) throw new Error("Invalid credentials");

  const validPassword = await bcrypt.compare(password, user.password);
  if (!validPassword) throw new Error("Invalid credentials");

  const accessToken = tokenService.generateAccessToken(user);
  const refreshToken = tokenService.generateRefreshToken(user);
  await tokenService.saveRefreshToken(user.id, refreshToken);

  return {
    accessToken,
    refreshToken,
    user: {
      id: user.id,
      name: user.name,
      email: decryptEmail(user.email_cipher),
      role: user.role,
    },
  };
};
