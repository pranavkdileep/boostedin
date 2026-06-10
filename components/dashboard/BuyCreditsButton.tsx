"use client";

import { useState } from "react";

import BillingPaymentDialog from "@/components/dashboard/BillingPaymentDialog";

type BuyCreditsButtonProps = {
  children: React.ReactNode;
  className: string;
};

export default function BuyCreditsButton({
  children,
  className,
}: BuyCreditsButtonProps) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button className={className} onClick={() => setOpen(true)} type="button">
        {children}
      </button>
      {open && <BillingPaymentDialog open={open} onClose={() => setOpen(false)} />}
    </>
  );
}
