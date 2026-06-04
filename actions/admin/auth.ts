"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import jwt from "jsonwebtoken";

const SESSION_COOKIE = "admin_session";
const SESSION_MAX_AGE_SECONDS = 24 * 60 * 60;

function getAdminCredentials() {
  const username = process.env.ADMIN_USERNAME;
  const password = process.env.ADMIN_PASSWORD;

  if (!username || !password) {
    throw new Error(
      "ADMIN_USERNAME or ADMIN_PASSWORD is not defined in .env.local"
    );
  }

  return { username, password };
}

function getJwtSecret(): string {
  const secret = process.env.JWT_SECRET_KEY;
  if (!secret) {
    throw new Error("JWT_SECRET_KEY is not defined in .env.local");
  }
  return secret;
}

export async function adminLogin(formData: FormData) {
  "use server";

  const { username, password } = getAdminCredentials();
  const inputUsername = formData.get("username") as string;
  const inputPassword = formData.get("password") as string;

  if (inputUsername !== username || inputPassword !== password) {
    throw new Error("Invalid admin credentials");
  }

  const token = jwt.sign({ role: "admin", username }, getJwtSecret(), {
    expiresIn: SESSION_MAX_AGE_SECONDS,
  });

  const cookieStore = await cookies();
  cookieStore.set(SESSION_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: SESSION_MAX_AGE_SECONDS,
  });

  redirect("/admin");
}

export async function adminLogout() {
  "use server";

  const cookieStore = await cookies();
  cookieStore.delete(SESSION_COOKIE);
  redirect("/admin/login");
}

export async function verifyAdmin(): Promise<{ username: string }> {
  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE)?.value;

  if (!token) {
    throw new Error("Not authenticated");
  }

  try {
    const decoded = jwt.verify(token, getJwtSecret()) as {
      role: string;
      username: string;
    };

    if (decoded.role !== "admin") {
      throw new Error("Not authorized");
    }

    return { username: decoded.username };
  } catch {
    throw new Error("Not authenticated");
  }
}
