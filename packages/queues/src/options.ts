import type { JobsOptions, QueueOptions } from "bullmq";

export const DEFAULT_JOB_OPTIONS = {
  attempts: 3,
  backoff: {
    type: "exponential",
    delay: 1_000,
  },
  removeOnComplete: {
    age: 86_400,
    count: 1_000,
  },
  removeOnFail: {
    age: 604_800,
    count: 5_000,
  },
} as const satisfies JobsOptions;

export const DEFAULT_QUEUE_OPTIONS = {
  defaultJobOptions: DEFAULT_JOB_OPTIONS,
} as const satisfies Pick<QueueOptions, "defaultJobOptions">;
