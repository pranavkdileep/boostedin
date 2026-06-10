"use server";

import { randomBytes } from "crypto";
import { cookies, headers } from "next/headers";
import { redirect } from "next/navigation";

import { verifyUser } from "@/actions/auth/login";

const LINKEDIN_AUTH_URL = "https://www.linkedin.com/oauth/v2/authorization";
const LINKEDIN_POSTING_SCOPES = "openid profile email w_member_social";
const SESSION_COOKIE = "session";
const STATE_COOKIE = "linkedin_oauth_state";
const OAUTH_INTENT_COOKIE = "linkedin_oauth_intent";
const OAUTH_USER_COOKIE = "linkedin_oauth_user_id";
const STATE_MAX_AGE_SECONDS = 10 * 60;

function getLinkedInClientId(): string {
  const clientId = process.env.LINKEDIN_CLIENT_ID;
  if (!clientId) {
    throw new Error("LINKEDIN_CLIENT_ID is not defined in .env.local");
  }
  return clientId;
}

async function getBaseUrl(): Promise<string> {
  const headerList = await headers();
  const host = headerList.get("host") ?? process.env.DEFAULT_HOST!;
  const forwardedProto = headerList.get("x-forwarded-proto");
  const protocol =
    forwardedProto ?? (host.includes("localhost") ? "http" : "https");
  return `${protocol}://${host}`;
}

export async function allowLinkedInPostingAccess() {
  let clientId: string;

  try {
    clientId = getLinkedInClientId();
  } catch (err) {
    const message = err instanceof Error ? err.message : "LinkedIn is not configured";
    redirect(`/dash/settings?linkedin=error&message=${encodeURIComponent(message)}`);
  }

  const baseUrl = await getBaseUrl();
  const redirectUri = `${baseUrl}/api/auth/linkedin/callback`;
  const state = randomBytes(32).toString("hex");
  const cookieStore = await cookies();
  const sessionToken = cookieStore.get(SESSION_COOKIE)?.value;
  const currentUser = sessionToken ? await verifyUser(sessionToken) : null;

  if (!currentUser) {
    redirect("/auth?redirect=/dash/settings");
  }

  const cookieOptions = {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax" as const,
    path: "/",
    maxAge: STATE_MAX_AGE_SECONDS,
  };

  cookieStore.set(STATE_COOKIE, state, cookieOptions);
  cookieStore.set(OAUTH_INTENT_COOKIE, "linkedin_posting", cookieOptions);
  cookieStore.set(OAUTH_USER_COOKIE, currentUser._id, cookieOptions);

  const authUrl = new URL(LINKEDIN_AUTH_URL);
  authUrl.searchParams.set("response_type", "code");
  authUrl.searchParams.set("client_id", clientId);
  authUrl.searchParams.set("redirect_uri", redirectUri);
  authUrl.searchParams.set("scope", LINKEDIN_POSTING_SCOPES);
  authUrl.searchParams.set("state", state);

  redirect(authUrl.toString());
}
