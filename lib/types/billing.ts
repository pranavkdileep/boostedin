export type BillingStatus = "waiting" | "waiting_for_webhook" | "success" | "timeout";

export interface Billing {
  billingId: string;

  userId: string;

  amountPaid: number;
  amountCredited: number;

  time: Date;
  status: BillingStatus;

  orderId: string;
}
