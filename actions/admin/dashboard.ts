"use server";

import { db } from "@/lib/db/db";
import type { SupportTicket } from "@/lib/types/supportTicket";
import type { User } from "@/lib/types/user";
import type { Post } from "@/lib/types/post";

const USERS_COLLECTION = "users";
const POSTS_COLLECTION = "posts";
const TICKETS_COLLECTION = "supportTickets";

export interface AdminStats {
  totalUsers: number;
  totalPosts: number;
  ticketsByStatus: Record<string, number>;
  recentTickets: {
    _id: string;
    subject: string;
    email: string;
    status: string;
    createdAt: Date;
  }[];
  recentUsers: {
    _id: string;
    name: string;
    email: string;
    credits: number;
    createdAt: Date;
  }[];
}

export async function getAdminStats(): Promise<AdminStats> {
  const usersCollection = db.collection<User>(USERS_COLLECTION);
  const postsCollection = db.collection<Post>(POSTS_COLLECTION);
  const ticketsCollection =
    db.collection<SupportTicket>(TICKETS_COLLECTION);

  const [totalUsers, totalPosts, ticketsByStatusArr, recentTickets, recentUsers] =
    await Promise.all([
      usersCollection.countDocuments(),
      postsCollection.countDocuments(),
      ticketsCollection
        .aggregate([
          { $group: { _id: "$status", count: { $sum: 1 } } },
        ])
        .toArray(),
      ticketsCollection
        .find(
          {},
          {
            sort: { createdAt: -1 },
            limit: 5,
            projection: {
              _id: 1,
              subject: 1,
              email: 1,
              status: 1,
              createdAt: 1,
            },
          }
        )
        .toArray(),
      usersCollection
        .find(
          {},
          {
            sort: { createdAt: -1 },
            limit: 5,
            projection: {
              _id: 1,
              name: 1,
              email: 1,
              credits: 1,
              createdAt: 1,
            },
          }
        )
        .toArray(),
    ]);

  const ticketsByStatus: Record<string, number> = {
    open: 0,
    in_progress: 0,
    resolved: 0,
    closed: 0,
  };

  for (const item of ticketsByStatusArr) {
    ticketsByStatus[item._id as string] = item.count as number;
  }

  return {
    totalUsers,
    totalPosts,
    ticketsByStatus,
    recentTickets: recentTickets as unknown as AdminStats["recentTickets"],
    recentUsers: recentUsers as unknown as AdminStats["recentUsers"],
  };
}
