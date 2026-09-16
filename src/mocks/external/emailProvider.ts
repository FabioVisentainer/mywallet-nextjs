// Simulates a third-party transactional-email/SMS provider (Req. 3: recovery
// link by e-mail; Req. 15: system feedback messages). The provider owns the
// delivery record — the app only asks it to send and reads back a receipt.
// Swap this module for a real call to a provider (SES, SendGrid, Twilio…)
// without touching callers.

export interface DeliveryReceipt {
  id: string;
  to: string;
  subject: string;
  status: "delivered" | "failed";
  provider: string;
}

let seq = 0;

/** "Sends" a transactional e-mail and returns the external provider's delivery receipt. */
export function sendTransactionalEmail(to: string, subject: string): DeliveryReceipt {
  seq += 1;
  return { id: "msg" + seq, to, subject, status: "delivered", provider: "MockMail" };
}
