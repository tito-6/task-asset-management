import jwt from "jsonwebtoken";

import { env } from "../config/env.js";

export type JwtUserPayload = {
  userId: number;
};

export const signAccessToken = (payload: JwtUserPayload): string => {
  return jwt.sign(payload, env.JWT_SECRET, { expiresIn: "12h" });
};

export const verifyAccessToken = (token: string): JwtUserPayload => {
  return jwt.verify(token, env.JWT_SECRET) as JwtUserPayload;
};
