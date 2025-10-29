import { createCipheriv, createDecipheriv, randomBytes } from "crypto";

import { env } from "../config/env.js";

const KEY = (() => {
  const buffer = Buffer.from(env.ENCRYPTION_KEY, "base64");
  if (buffer.length !== 32) {
    throw new Error("ENCRYPTION_KEY must be a 32-byte value encoded in base64.");
  }

  return buffer;
})();

const ALGO = "aes-256-gcm";
const IV_LENGTH = 12; // recommended for GCM

export type EncryptionPayload = {
  cipherText: string;
  iv: string;
  tag: string;
};

export const encryptSecret = (plainText: string): EncryptionPayload => {
  const iv = randomBytes(IV_LENGTH);
  const cipher = createCipheriv(ALGO, KEY, iv);
  const encrypted = Buffer.concat([cipher.update(plainText, "utf8"), cipher.final()]);
  const authTag = cipher.getAuthTag();

  return {
    cipherText: encrypted.toString("base64"),
    iv: iv.toString("base64"),
    tag: authTag.toString("base64")
  };
};

export const decryptSecret = (payload: EncryptionPayload): string => {
  try {
    const decipher = createDecipheriv(ALGO, KEY, Buffer.from(payload.iv, "base64"));
    const tagBuffer = Buffer.from(payload.tag, "base64");
    
    // GCM auth tag must be 16 bytes (128 bits)
    if (tagBuffer.length !== 16) {
      console.warn(`Invalid auth tag length: ${tagBuffer.length}, expected 16. Returning placeholder.`);
      return "[Encrypted - Cannot Decrypt]";
    }
    
    decipher.setAuthTag(tagBuffer);

    const decrypted = Buffer.concat([
      decipher.update(Buffer.from(payload.cipherText, "base64")),
      decipher.final()
    ]);

    return decrypted.toString("utf8");
  } catch (error) {
    console.error("Decryption error:", error);
    return "[Encrypted - Cannot Decrypt]";
  }
};
