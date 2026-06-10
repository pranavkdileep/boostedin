"use client";

import { useEffect, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { createPortal } from "react-dom";
import { QRCodeSVG } from "qrcode.react";

import {
  createBillingOrder,
  getBillingPaymentStatus,
  type ClientBilling,
} from "@/actions/user/billing";

const PAYMENT_TIMEOUT_SECONDS = 10 * 60;

type DialogStep =
  | "amount"
  | "creating"
  | "confirm"
  | "waiting"
  | "processing"
  | "success"
  | "timeout"
  | "error";

type BillingPaymentDialogProps = {
  open: boolean;
  onClose: () => void;
};

export default function BillingPaymentDialog({
  open,
  onClose,
}: BillingPaymentDialogProps) {
  const router = useRouter();
  const [amount, setAmount] = useState("");
  const [step, setStep] = useState<DialogStep>("amount");
  const [billing, setBilling] = useState<ClientBilling | null>(null);
  const [upiIntent, setUpiIntent] = useState("");
  const [secondsLeft, setSecondsLeft] = useState(PAYMENT_TIMEOUT_SECONDS);
  const [error, setError] = useState("");
  const [isPending, startTransition] = useTransition();

  const isPolling = step === "waiting" || step === "processing";

  useEffect(() => {
    if (!open || !isPolling || !billing) {
      return;
    }

    let cancelled = false;
    const activeBilling = billing;

    async function pollStatus() {
      try {
        const result = await getBillingPaymentStatus(activeBilling.orderId);

        if (cancelled) {
          return;
        }

        setBilling(result.billing);

        if (result.billing.status === "waiting_for_webhook") {
          setStep("processing");
          return;
        }

        if (result.billing.status === "success") {
          setStep("success");
          router.refresh();
          return;
        }

        if (result.billing.status === "timeout") {
          setStep("timeout");
        }
      } catch (pollError) {
        if (!cancelled) {
          setError(
            pollError instanceof Error
              ? pollError.message
              : "Unable to check payment status"
          );
          setStep("error");
        }
      }
    }

    pollStatus();
    const intervalId = window.setInterval(pollStatus, 1000);

    return () => {
      cancelled = true;
      window.clearInterval(intervalId);
    };
  }, [billing, isPolling, open, router]);

  useEffect(() => {
    if (!open || !isPolling) {
      return;
    }

    const intervalId = window.setInterval(() => {
      setSecondsLeft((current) => {
        if (current <= 1) {
          setStep((activeStep) =>
            activeStep === "success" || activeStep === "processing"
              ? activeStep
              : "timeout"
          );
          return 0;
        }

        return current - 1;
      });
    }, 1000);

    return () => window.clearInterval(intervalId);
  }, [isPolling, open]);

  if (!open) {
    return null;
  }

  function closeDialog() {
    onClose();
    if (step === "success") {
      router.refresh();
    }
  }

  function retryPayment() {
    setStep("amount");
    setBilling(null);
    setUpiIntent("");
    setSecondsLeft(PAYMENT_TIMEOUT_SECONDS);
    setError("");
  }

  function submitAmount() {
    const parsedAmount = Number(amount);
    setError("");

    if (!Number.isFinite(parsedAmount) || parsedAmount <= 0) {
      setError("Enter an amount greater than 0.");
      setStep("error");
      return;
    }

    setStep("creating");
    startTransition(async () => {
      try {
        const result = await createBillingOrder(parsedAmount);
        setBilling(result.billing);
        setUpiIntent(result.upiIntent);
        setSecondsLeft(PAYMENT_TIMEOUT_SECONDS);
        setStep("confirm");
      } catch (createError) {
        setError(
          createError instanceof Error
            ? createError.message
            : "Unable to create payment order"
        );
        setStep("error");
      }
    });
  }

  function startPayment() {
    setSecondsLeft(PAYMENT_TIMEOUT_SECONDS);
    setStep("waiting");
  }

  const title = getDialogTitle(step);

  const dialog = (
    <div className="fixed inset-0 z-[80] flex items-center justify-center bg-inverse-surface/40 p-4 backdrop-blur-sm">
      <div className="w-[min(92vw,28rem)] min-w-0 overflow-hidden rounded-[28px] border border-outline-variant/20 bg-surface-container-lowest shadow-[0_30px_90px_rgba(15,23,42,0.25)]">
        <div className="flex items-center justify-between border-b border-outline-variant/10 px-5 py-4">
          <div className="min-w-0">
            <p className="font-label-sm text-label-sm uppercase tracking-[0.2em] text-secondary">
              UPI Payment
            </p>
            <h2 className="mt-1 font-headline-md text-headline-md font-bold text-on-background">
              {title}
            </h2>
          </div>
          <button
            aria-label="Close payment dialog"
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-on-surface-variant transition-colors hover:bg-surface-container hover:text-on-surface"
            onClick={closeDialog}
            type="button"
          >
            <CloseIcon />
          </button>
        </div>

        <div className="space-y-5 p-5">
          {(step === "amount" || step === "creating") && (
            <div className="space-y-4">
              <div>
                <label className="font-label-md text-label-md font-bold text-on-surface" htmlFor="credit-amount">
                  Credits to buy
                </label>
                <input
                  className="mt-2 h-12 w-full rounded-xl border border-outline-variant/30 bg-surface px-4 font-body-lg text-body-lg text-on-surface outline-none transition-colors placeholder:text-on-surface-variant/70 focus:border-primary focus:ring-2 focus:ring-primary/15"
                  disabled={step === "creating" || isPending}
                  id="credit-amount"
                  inputMode="decimal"
                  min="1"
                  onChange={(event) => setAmount(event.target.value)}
                  placeholder="100"
                  type="number"
                  value={amount}
                />
                <p className="mt-2 font-body-md text-body-md text-on-surface-variant">
                  1 credit equals 1 rupee. The gateway may adjust the exact payable amount.
                </p>
              </div>
              <button
                className="bg-purple-gradient flex min-h-12 w-full items-center justify-center rounded-xl px-4 py-3 font-label-md text-label-md font-bold text-white shadow-[0_10px_24px_rgba(113,42,226,0.18)] transition-all hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-60 disabled:hover:translate-y-0"
                disabled={step === "creating" || isPending}
                onClick={submitAmount}
                type="button"
              >
                {step === "creating" || isPending ? "Creating order..." : "Create Payment Order"}
              </button>
            </div>
          )}

          {step === "confirm" && billing && (
            <div className="space-y-4">
              <PaymentSummary billing={billing} />
              <div className="rounded-2xl bg-surface-container p-4 font-body-md text-body-md text-on-surface-variant">
                Confirm the adjusted payable amount, then scan the QR code or open your UPI app.
              </div>
              <button
                className="bg-purple-gradient flex min-h-12 w-full items-center justify-center rounded-xl px-4 py-3 font-label-md text-label-md font-bold text-white shadow-[0_10px_24px_rgba(113,42,226,0.18)] transition-all hover:-translate-y-0.5"
                onClick={startPayment}
                type="button"
              >
                Pay ₹{formatCurrencyValue(billing.amountPaid)}
              </button>
            </div>
          )}

          {(step === "waiting" || step === "processing") && billing && (
            <div className="space-y-5">
              <PaymentSummary billing={billing} />
              {step === "waiting" ? (
                <div className="flex flex-col items-center rounded-3xl border border-outline-variant/20 bg-white p-5 text-center">
                  <QRCodeSVG value={upiIntent} size={220} marginSize={2} />
                  <a
                    className="mt-4 inline-flex min-h-11 items-center justify-center rounded-xl bg-primary px-4 py-2 font-label-md text-label-md font-bold text-on-primary transition-colors hover:bg-primary/90"
                    href={upiIntent}
                  >
                    Open UPI App
                  </a>
                </div>
              ) : (
                <div className="rounded-3xl border border-primary/20 bg-primary/5 p-5 text-center">
                  <div className="mx-auto mb-3 h-10 w-10 animate-spin rounded-full border-2 border-primary/20 border-t-primary" />
                  <p className="font-label-md text-label-md font-bold text-primary">
                    Processing payment
                  </p>
                  <p className="mt-1 font-body-md text-body-md text-on-surface-variant">
                    Payment matched at the gateway. Waiting for secure webhook confirmation.
                  </p>
                </div>
              )}
              <div className="flex items-center justify-between rounded-2xl bg-surface-container px-4 py-3">
                <span className="font-label-md text-label-md text-on-surface-variant">
                  Time remaining
                </span>
                <span className="font-headline-md text-headline-md font-bold text-on-background">
                  {formatTimer(secondsLeft)}
                </span>
              </div>
            </div>
          )}

          {step === "success" && (
            <ResultState
              actionLabel="Close"
              message="Your credits were added to your account."
              onAction={closeDialog}
              tone="success"
              title="Payment successful"
            />
          )}

          {step === "timeout" && (
            <ResultState
              actionLabel="Try Again"
              message="This payment order timed out. Create a new order to continue."
              onAction={retryPayment}
              tone="warning"
              title="Payment timed out"
            />
          )}

          {step === "error" && (
            <ResultState
              actionLabel="Try Again"
              message={error || "Something went wrong while processing payment."}
              onAction={retryPayment}
              tone="error"
              title="Payment error"
            />
          )}
        </div>
      </div>
    </div>
  );

  return createPortal(dialog, document.body);
}

function PaymentSummary({ billing }: { billing: ClientBilling }) {
  return (
    <div className="grid grid-cols-2 gap-3">
      <div className="rounded-2xl bg-surface-container p-4">
        <p className="font-label-sm text-label-sm uppercase tracking-wider text-on-surface-variant">
          Credits
        </p>
        <p className="mt-1 font-headline-md text-headline-md font-bold text-on-background">
          {formatCurrencyValue(billing.amountCredited)}
        </p>
      </div>
      <div className="rounded-2xl bg-surface-container p-4">
        <p className="font-label-sm text-label-sm uppercase tracking-wider text-on-surface-variant">
          Payable
        </p>
        <p className="mt-1 font-headline-md text-headline-md font-bold text-primary">
          ₹{formatCurrencyValue(billing.amountPaid)}
        </p>
      </div>
    </div>
  );
}

function ResultState({
  actionLabel,
  message,
  onAction,
  title,
  tone,
}: {
  actionLabel: string;
  message: string;
  onAction: () => void;
  title: string;
  tone: "success" | "warning" | "error";
}) {
  const toneClasses = {
    success: "bg-green-50 text-green-700 border-green-200",
    warning: "bg-yellow-50 text-yellow-700 border-yellow-200",
    error: "bg-red-50 text-red-700 border-red-200",
  }[tone];

  return (
    <div className="space-y-4 text-center">
      <div className={`rounded-3xl border p-5 ${toneClasses}`}>
        <p className="font-headline-md text-headline-md font-bold">
          {title}
        </p>
        <p className="mt-2 font-body-md text-body-md">
          {message}
        </p>
      </div>
      <button
        className="flex min-h-12 w-full items-center justify-center rounded-xl bg-primary px-4 py-3 font-label-md text-label-md font-bold text-on-primary transition-colors hover:bg-primary/90"
        onClick={onAction}
        type="button"
      >
        {actionLabel}
      </button>
    </div>
  );
}

function getDialogTitle(step: DialogStep) {
  if (step === "confirm") return "Confirm Amount";
  if (step === "waiting") return "Scan UPI QR";
  if (step === "processing") return "Processing";
  if (step === "success") return "Success";
  if (step === "timeout") return "Timed Out";
  if (step === "error") return "Try Again";
  return "Buy Credits";
}

function formatCurrencyValue(value: number) {
  return new Intl.NumberFormat("en-IN", {
    maximumFractionDigits: 2,
    minimumFractionDigits: Number.isInteger(value) ? 0 : 2,
  }).format(value);
}

function formatTimer(totalSeconds: number) {
  const minutes = Math.floor(totalSeconds / 60).toString().padStart(2, "0");
  const seconds = (totalSeconds % 60).toString().padStart(2, "0");
  return `${minutes}:${seconds}`;
}

function CloseIcon() {
  return (
    <svg aria-hidden="true" className="h-5 w-5" fill="none" viewBox="0 0 24 24">
      <path d="M6 6l12 12M18 6 6 18" stroke="currentColor" strokeLinecap="round" strokeWidth="2" />
    </svg>
  );
}
