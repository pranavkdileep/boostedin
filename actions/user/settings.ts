"use server";

import { revalidatePath } from "next/cache";
import { cookies } from "next/headers";

import { verifyUser } from "@/actions/auth/login";
import { db } from "@/lib/db/db";
import type { NotificationSettings, User } from "@/lib/types/user";

const SESSION_COOKIE = "session";
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
