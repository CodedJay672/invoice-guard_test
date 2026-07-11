export const QUEUE_NAMES = {
  reportGeneration: "report-generation-queue",
  pdfGeneration: "pdf-generation-queue",
  email: "email-queue",
  providerAlert: "provider-alert-queue",
  maintenance: "maintenance-queue",
  refund: "refund-queue",
} as const;

export type QueueName = (typeof QUEUE_NAMES)[keyof typeof QUEUE_NAMES];
