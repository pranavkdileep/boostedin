"use server";

import { db } from "@/lib/db/db";
import type { User } from "@/lib/types/user";

const USERS_COLLECTION = "users";
const POSTS_COLLECTION = "posts";

export interface AdminUserItem {
  _id: string;
  name: string;
  email: string;
  credits: number;
  totalCreditsUsed: number;
  totalCreditsPurchased: number;
  postsGenerated: number;
  linkedinConnected: boolean;
  createdAt: Date;
}

export interface AdminUserResult {
  items: AdminUserItem[];
  page: number;
  pageSize: number;
  total: number;
  totalPages: number;
}

export async function getAllUsers(
  page = 1,
  pageSize = 20
): Promise<AdminUserResult> {
  const usersCollection = db.collection<User>(USERS_COLLECTION);

  const total = await usersCollection.countDocuments();
  const totalPages = Math.ceil(total / pageSize);
  const skip = (page - 1) * pageSize;

  const items = await usersCollection
    .find(
      {},
      {
        sort: { createdAt: -1 },
        skip,
        limit: pageSize,
        projection: {
          _id: 1,
          name: 1,
          email: 1,
          credits: 1,
          totalCreditsUsed: 1,
          totalCreditsPurchased: 1,
          postsGenerated: 1,
          "linkedin.isConnected": 1,
          createdAt: 1,
        },
      }
    )
    .toArray();

  return {
    items: items.map((u) => ({
      _id: u._id,
      name: u.name,
      email: u.email,
      credits: u.credits,
      totalCreditsUsed: u.totalCreditsUsed,
      totalCreditsPurchased: u.totalCreditsPurchased,
      postsGenerated: u.postsGenerated,
      linkedinConnected: u.linkedin?.isConnected ?? false,
      createdAt: u.createdAt,
    })),
    page,
    pageSize,
    total,
    totalPages,
  };
}

export async function getUserById(
  userId: string
): Promise<AdminUserItem & { postsCount: number }> {
  const usersCollection = db.collection<User>(USERS_COLLECTION);
  const postsCollection = db.collection(POSTS_COLLECTION);

  const [user, postsCount] = await Promise.all([
    usersCollection.findOne({ _id: userId }),
    postsCollection.countDocuments({ userId }),
  ]);

  if (!user) {
    throw new Error("User not found");
  }

  return {
    _id: user._id,
    name: user.name,
    email: user.email,
    credits: user.credits,
    totalCreditsUsed: user.totalCreditsUsed,
    totalCreditsPurchased: user.totalCreditsPurchased,
    postsGenerated: user.postsGenerated,
    linkedinConnected: user.linkedin?.isConnected ?? false,
    createdAt: user.createdAt,
    postsCount,
  };
}

export async function updateUserCredits(
  userId: string,
  amount: number
): Promise<void> {
  const usersCollection = db.collection<User>(USERS_COLLECTION);

  if (amount >= 0) {
    await usersCollection.updateOne(
      { _id: userId },
      {
        $inc: { credits: amount, totalCreditsPurchased: amount },
        $set: { updatedAt: new Date() },
      }
    );
  } else {
    await usersCollection.updateOne(
      { _id: userId },
      {
        $inc: { credits: amount, totalCreditsUsed: Math.abs(amount) },
        $set: { updatedAt: new Date() },
      }
    );
  }
}

export async function deleteUser(userId: string): Promise<void> {
  const usersCollection = db.collection<User>(USERS_COLLECTION);
  const postsCollection = db.collection(POSTS_COLLECTION);

  await Promise.all([
    usersCollection.deleteOne({ _id: userId }),
    postsCollection.deleteMany({ userId }),
  ]);
}
