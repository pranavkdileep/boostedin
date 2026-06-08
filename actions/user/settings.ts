"use server";

import { revalidatePath } from "next/cache";
import { cookies } from "next/headers";

import { verifyUser } from "@/actions/auth/login";
import { decrypt } from "@/actions/security/aes";
import { db } from "@/lib/db/db";
import type { NotificationSettings, User } from "@/lib/types/user";

const SESSION_COOKIE = "session";
const LINKEDIN_INTROSPECT_URL =
  "https://www.linkedin.com/oauth/v2/introspectToken";
const USERS_COLLECTION = "users";
const MAX_BIO_LENGTH = 500;

export interface UserSettings {
  profilePictureUrl: string | undefined;
  name: string;
  email: string;
  bio: string | undefined;
  credits: number;
  linkedinPostingEnabled: boolean;
  linkedin: User["linkedin"];
  notifications: User["notifications"];
}

export interface UpdateUserSettingsInput {
  name?: string;
  email?: string;
  bio?: string;
  notifications?: Partial<NotificationSettings>;
}

export async function getUserSettings(): Promise<UserSettings | null> {
  const cookieStore = await cookies();
  const sessionToken = cookieStore.get(SESSION_COOKIE)?.value;

  if (!sessionToken) return null;

  const user = await verifyUser(sessionToken);
  if (!user) return null;

  return {
    profilePictureUrl: user.profilePictureUrl,
    name: user.name,
    email: user.email,
    bio: user.bio,
    credits: user.credits,
    linkedinPostingEnabled: hasValidPostingToken(user),
    linkedin: user.linkedin,
    notifications: user.notifications,
  };
}

function hasValidPostingToken(user: User): boolean {
  if (!user.linkedinPostingEnabled || !user.linkedin.postingAccessToken) {
    return false;
  }

  if (!user.linkedin.postingTokenExpiresAt) {
    return true;
  }

  return new Date(user.linkedin.postingTokenExpiresAt).getTime() > Date.now();
}

interface LinkedInTokenIntrospectionResponse {
  active: boolean;
  status?: "active" | "expired" | "revoked";
  expires_at?: number;
  scope?: string;
}

type PostingTokenInspection =
  | {
      isValid: true;
      expiresAt?: Date;
      scopes?: string[];
    }
  | {
      isValid: false;
    }
  | {
      isValid: null;
    };

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

function parseLinkedInScopes(scope: string | undefined): string[] | undefined {
  if (!scope) {
    return undefined;
  }

  return scope.split(/[\s,]+/).filter(Boolean);
}

async function inspectLinkedInPostingToken(
  encryptedToken: string
): Promise<PostingTokenInspection> {
  let token: string;

  try {
    token = decrypt(encryptedToken);
  } catch {
    return { isValid: false };
  }

  let clientId: string;
  let clientSecret: string;

  try {
    ({ clientId, clientSecret } = getLinkedInCredentials());
  } catch (error) {
    console.warn("Unable to inspect LinkedIn posting token", error);
    return { isValid: null };
  }

  try {
    const response = await fetch(LINKEDIN_INTROSPECT_URL, {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        client_id: clientId,
        client_secret: clientSecret,
        token,
      }),
    });

    if (!response.ok) {
      return { isValid: null };
    }

    const payload =
      (await response.json()) as LinkedInTokenIntrospectionResponse;
    const scopes = parseLinkedInScopes(payload.scope);

    if (
      !payload.active ||
      payload.status === "revoked" ||
      payload.status === "expired" ||
      (scopes !== undefined && !scopes.includes("w_member_social"))
    ) {
      return { isValid: false };
    }

    const expiresAt =
      typeof payload.expires_at === "number"
        ? new Date(payload.expires_at * 1000)
        : undefined;

    if (expiresAt && expiresAt.getTime() <= Date.now()) {
      return { isValid: false };
    }

    return {
      isValid: true,
      expiresAt,
      scopes,
    };
  } catch (error) {
    console.warn("Unable to inspect LinkedIn posting token", error);
    return { isValid: null };
  }
}

export async function syncLinkedInPostingAccessState(): Promise<void> {
  const cookieStore = await cookies();
  const sessionToken = cookieStore.get(SESSION_COOKIE)?.value;

  if (!sessionToken) {
    return;
  }

  const currentUser = await verifyUser(sessionToken);
  if (!currentUser) {
    return;
  }

  const hasStoredPostingData =
    currentUser.linkedinPostingEnabled ||
    currentUser.linkedin.postingAccessToken !== undefined ||
    currentUser.linkedin.postingTokenExpiresAt !== undefined ||
    (currentUser.linkedin.postingScopes?.length ?? 0) > 0;

  if (!hasStoredPostingData) {
    return;
  }

  if (!currentUser.linkedin.postingAccessToken) {
    await clearLinkedInPostingAccess(currentUser._id);
    return;
  }

  const inspection = await inspectLinkedInPostingToken(
    currentUser.linkedin.postingAccessToken
  );

  if (inspection.isValid === false) {
    await clearLinkedInPostingAccess(currentUser._id);
    return;
  }

  if (inspection.isValid === true) {
    await updateLinkedInPostingAccess(currentUser._id, inspection);
    return;
  }

  if (
    currentUser.linkedin.postingTokenExpiresAt &&
    new Date(currentUser.linkedin.postingTokenExpiresAt).getTime() <= Date.now()
  ) {
    await clearLinkedInPostingAccess(currentUser._id);
  }
}

async function clearLinkedInPostingAccess(userId: string): Promise<void> {
  const usersCollection = db.collection<User>(USERS_COLLECTION);

  await usersCollection.updateOne(
    { _id: userId },
    {
      $set: {
        linkedinPostingEnabled: false,
        updatedAt: new Date(),
      },
      $unset: {
        "linkedin.postingAccessToken": "",
        "linkedin.postingTokenExpiresAt": "",
        "linkedin.postingScopes": "",
      },
    }
  );
}

async function updateLinkedInPostingAccess(
  userId: string,
  inspection: Extract<PostingTokenInspection, { isValid: true }>
): Promise<void> {
  const usersCollection = db.collection<User>(USERS_COLLECTION);
  const updates: Record<string, unknown> = {
    linkedinPostingEnabled: true,
    updatedAt: new Date(),
  };

  if (inspection.expiresAt) {
    updates["linkedin.postingTokenExpiresAt"] = inspection.expiresAt;
  }

  if (inspection.scopes) {
    updates["linkedin.postingScopes"] = inspection.scopes;
  }

  await usersCollection.updateOne({ _id: userId }, { $set: updates });
}

function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

export async function updateUserSettings(
  input: UpdateUserSettingsInput
): Promise<User> {
  const cookieStore = await cookies();
  const sessionToken = cookieStore.get(SESSION_COOKIE)?.value;

  if (!sessionToken) {
    throw new Error("Not authenticated");
  }

  const currentUser = await verifyUser(sessionToken);
  if (!currentUser) {
    throw new Error("Not authenticated");
  }

  const usersCollection = db.collection<User>(USERS_COLLECTION);
  const updates: Record<string, unknown> = {};

  if (input.name !== undefined) {
    const name = input.name.trim();
    if (!name) {
      throw new Error("Name cannot be empty");
    }
    updates.name = name;
  }

  if (input.email !== undefined) {
    const email = input.email.trim().toLowerCase();
    if (!email || !isValidEmail(email)) {
      throw new Error("Invalid email");
    }
    if (email !== currentUser.email) {
      const existing = await usersCollection.findOne({ email });
      if (existing && existing._id !== currentUser._id) {
        throw new Error("Email is already in use");
      }
      updates.email = email;
      updates.isEmailVerified = false;
    }
  }

  if (input.bio !== undefined) {
    const bio = input.bio.trim();
    if (bio.length > MAX_BIO_LENGTH) {
      throw new Error(`Bio must be ${MAX_BIO_LENGTH} characters or fewer`);
    }
    updates.bio = bio.length > 0 ? bio : undefined;
  }

  if (input.notifications) {
    updates.notifications = {
      ...currentUser.notifications,
      ...input.notifications,
    };
  }

  if (Object.keys(updates).length === 0) {
    return currentUser;
  }

  updates.updatedAt = new Date();

  const updated = await usersCollection.findOneAndUpdate(
    { _id: currentUser._id },
    { $set: updates },
    { returnDocument: "after" }
  );

  if (!updated) {
    throw new Error("Failed to update user");
  }

  revalidatePath("/dash/settings");

  return updated as User;
}
