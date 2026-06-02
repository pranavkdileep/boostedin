"use server";
import { cookies, headers } from "next/headers";
import { redirect } from "next/navigation";
import { randomBytes } from "crypto";
import jwt from "jsonwebtoken";

import { db } from "@/lib/db/db";
import { encrypt } from "@/actions/security/aes";
import type { User } from "@/lib/types/user";

const LINKEDIN_AUTH_URL = "https://www.linkedin.com/oauth/v2/authorization";
const LINKEDIN_TOKEN_URL = "https://www.linkedin.com/oauth/v2/accessToken";
const LINKEDIN_USERINFO_URL = "https://api.linkedin.com/v2/userinfo";
const LINKEDIN_SCOPES = "openid profile email";

const SESSION_COOKIE = "session";
const STATE_COOKIE = "linkedin_oauth_state";
const SESSION_MAX_AGE_SECONDS = 7 * 24 * 60 * 60;
const STATE_MAX_AGE_SECONDS = 10 * 60;

const USERS_COLLECTION = "users";

function getJwtSecret(): string {
  const secret = process.env.JWT_SECRET_KEY;
  if (!secret) {
    throw new Error("JWT_SECRET_KEY is not defined in .env.local");
  }
  return secret;
}

function getLinkedInCredentials(): { clientId: string; clientSecret: string } {
  const clientId = process.env.LINKEDIN_CLIENT_ID;
  const clientSecret = process.env.LINKEDIN_CLIENT_SECRET;
  if (!clientId || !clientSecret) {
    throw new Error(
      "LINKEDIN_CLIENT_ID or LINKEDIN_CLIENT_SECRET is not defined in .env.local"
    );
  }
  return { clientId, clientSecret };
}

async function getBaseUrl(): Promise<string> {
  const headerList = await headers();
  const host = headerList.get("host") ?? "localhost:3000";
  const forwardedProto = headerList.get("x-forwarded-proto");
  const protocol =
    forwardedProto ?? (host.includes("localhost") ? "http" : "https");
  return `${protocol}://${host}`;
}

export async function signInWithLinkedIn() {
  "use server";

  const { clientId } = getLinkedInCredentials();
  const baseUrl = await getBaseUrl();
  const redirectUri = `${baseUrl}/api/auth/linkedin/callback`;

  const state = randomBytes(32).toString("hex");
  const cookieStore = await cookies();
  cookieStore.set(STATE_COOKIE, state, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: STATE_MAX_AGE_SECONDS,
  });

  const authUrl = new URL(LINKEDIN_AUTH_URL);
  authUrl.searchParams.set("response_type", "code");
  authUrl.searchParams.set("client_id", clientId);
  authUrl.searchParams.set("redirect_uri", redirectUri);
  authUrl.searchParams.set("scope", LINKEDIN_SCOPES);
  authUrl.searchParams.set("state", state);

  redirect(authUrl.toString());
}

interface LinkedInTokenResponse {
  access_token: string;
  expires_in: number;
  scope: string;
  token_type: string;
  id_token?: string;
}

interface LinkedInUserInfo {
  sub: string;
  name: string;
  given_name: string;
  family_name: string;
  email: string;
  email_verified: boolean;
  picture?: string;
  locale?: string;
}

export async function handleLinkedInCallback(
  code: string,
  state: string
): Promise<{ user: User; token: string }> {
  const cookieStore = await cookies();
  const stateCookie = cookieStore.get(STATE_COOKIE);

  if (!stateCookie || stateCookie.value !== state) {
    throw new Error("Invalid OAuth state");
  }

  cookieStore.delete(STATE_COOKIE);

  const { clientId, clientSecret } = getLinkedInCredentials();
  const baseUrl = await getBaseUrl();
  const redirectUri = `${baseUrl}/api/auth/linkedin/callback`;

  const tokenResponse = await fetch(LINKEDIN_TOKEN_URL, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      grant_type: "authorization_code",
      code,
      redirect_uri: redirectUri,
      client_id: clientId,
      client_secret: clientSecret,
    }),
  });

  if (!tokenResponse.ok) {
    const errorText = await tokenResponse.text();
    throw new Error(`LinkedIn token exchange failed: ${errorText}`);
  }

  const tokenData = (await tokenResponse.json()) as LinkedInTokenResponse;
  const accessToken = tokenData.access_token;
  const tokenExpiresAt = new Date(
    Date.now() + tokenData.expires_in * 1000
  );

  const userInfoResponse = await fetch(LINKEDIN_USERINFO_URL, {
    headers: { Authorization: `Bearer ${accessToken}` },
  });

  if (!userInfoResponse.ok) {
    const errorText = await userInfoResponse.text();
    throw new Error(`LinkedIn userinfo fetch failed: ${errorText}`);
  }

  const userInfo = (await userInfoResponse.json()) as LinkedInUserInfo;
  const encryptedAccessToken = encrypt(accessToken);

  const usersCollection = db.collection<User>(USERS_COLLECTION);
  const now = new Date();

  const existingUser = await usersCollection.findOne({
    email: userInfo.email,
  });

  let user: User;

  if (existingUser) {
    const updated = await usersCollection.findOneAndUpdate(
      { email: userInfo.email },
      {
        $set: {
          name: userInfo.name,
          profilePictureUrl: userInfo.picture,
          "linkedin.accessToken": encryptedAccessToken,
          "linkedin.tokenExpiresAt": tokenExpiresAt,
          "linkedin.firstName": userInfo.given_name,
          "linkedin.lastName": userInfo.family_name,
          "linkedin.profilePictureUrl": userInfo.picture,
          "linkedin.isConnected": true,
          lastLoginAt: now,
          updatedAt: now,
        },
      },
      { returnDocument: "after" }
    );

    user = (updated ?? existingUser) as User;
  } else {
    const newUser: User = {
      _id: randomBytes(16).toString("hex"),
      name: userInfo.name,
      email: userInfo.email,
      profilePictureUrl: userInfo.picture,
      credits: 0,
      linkedin: {
        linkedinId: userInfo.sub,
        accessToken: encryptedAccessToken,
        tokenExpiresAt,
        firstName: userInfo.given_name,
        lastName: userInfo.family_name,
        profilePictureUrl: userInfo.picture,
        isConnected: true,
      },
      notifications: {
        newPostScheduled: true,
        weeklyReport: true,
        creditAlert: true,
      },
      isEmailVerified: userInfo.email_verified ?? false,
      totalCreditsPurchased: 0,
      totalCreditsUsed: 0,
      postsGenerated: 0,
      articlesGenerated: 0,
      lastLoginAt: now,
      createdAt: now,
      updatedAt: now,
    };

    await usersCollection.insertOne(newUser as unknown as User);
    user = newUser;
  }

  const token = jwt.sign(
    { userId: user._id, email: user.email },
    getJwtSecret(),
    { expiresIn: SESSION_MAX_AGE_SECONDS }
  );

  cookieStore.set(SESSION_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: SESSION_MAX_AGE_SECONDS,
  });

  return { user, token };
}

export async function verifyUser(cookieValue: string): Promise<User | null> {
  if (!cookieValue) return null;

  try {
    const decoded = jwt.verify(cookieValue, getJwtSecret()) as {
      userId: string;
      email: string;
    };

    const usersCollection = db.collection<User>(USERS_COLLECTION);
    const user = await usersCollection.findOne({ _id: decoded.userId });
    return user;
  } catch {
    return null;
  }
}
