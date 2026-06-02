import jwt from "jsonwebtoken";

export interface SessionPayload {
  userId: string;
  email: string;
}

function getJwtSecret(): string {
  const secret = process.env.JWT_SECRET_KEY;
  if (!secret) {
    throw new Error("JWT_SECRET_KEY is not defined in .env.local");
  }
  return secret;
}

export function verifyToken(token: string | undefined): SessionPayload | null {
  if (!token) return null;

  try {
    const decoded = jwt.verify(token, getJwtSecret()) as SessionPayload;
    if (
      typeof decoded?.userId !== "string" ||
      typeof decoded?.email !== "string"
    ) {
      return null;
    }
    return decoded;
  } catch {
    return null;
  }
}
