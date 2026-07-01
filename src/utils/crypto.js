import crypto from "crypto";

const algorithm = "aes-256-cbc";

const key = Buffer.from(process.env.EMAIL_SECRET_KEY);
const iv = Buffer.from(process.env.EMAIL_IV);

export const encryptEmail = (email) => {
  const cipher = crypto.createCipheriv(algorithm, key, iv);

  let encrypted = cipher.update(email, "utf8", "hex");
  encrypted += cipher.final("hex");

  return encrypted;
};

export const decryptEmail = (encryptedEmail) => {
  const decipher = crypto.createDecipheriv(algorithm, key, iv);

  let decrypted = decipher.update(encryptedEmail, "hex", "utf8");
  decrypted += decipher.final("utf8");

  return decrypted;
};

export const hashEmail = (email) => {
  return crypto.createHash("sha256").update(email).digest("hex");
};
