import * as jwt from "jsonwebtoken";
import type { SignOptions } from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET || "please_set_jwt_secret";

export function signToken(payload: object, expiresIn: jwt.SignOptions["expiresIn"] = "7d") {
  const options: SignOptions = { expiresIn };
  return jwt.sign(payload, JWT_SECRET as jwt.Secret, options);
}

export function verifyToken(token: string) {
  try {
    return jwt.verify(token, JWT_SECRET);
  } catch {
    return null;
  }
}
