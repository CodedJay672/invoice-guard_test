import { Queue } from "bullmq";
import type { JobsOptions, QueueOptions } from "bullmq";

import { createQueueConnection } from "./connection.js";
import { DEFAULT_JOB_OPTIONS } from "./options.js";

export type QueueJobData = Record<string, unknown>;
export type QueueJobResult = unknown;
export type QueueJobName = string;

export interface CreateQueueOptions {
  name: string;
  connectionString: string;
  defaultJobOptions?: JobsOptions;
  queueOptions?: Omit<QueueOptions, "connection" | "defaultJobOptions">;
}

export type InvoiceGuardQueue<
  DataType extends QueueJobData = QueueJobData,
  ResultType = QueueJobResult,
  NameType extends QueueJobName = QueueJobName,
> = Queue<DataType, ResultType, NameType, DataType, ResultType, NameType>;

export function createQueue<
  DataType extends QueueJobData = QueueJobData,
  ResultType = QueueJobResult,
  NameType extends QueueJobName = QueueJobName,
>(options: CreateQueueOptions): InvoiceGuardQueue<DataType, ResultType, NameType> {
  if (!options.name) {
    throw new Error("A queue name is required.");
  }

  const connection = createQueueConnection({
    connectionString: options.connectionString,
  });

  return new Queue<DataType, ResultType, NameType, DataType, ResultType, NameType>(options.name, {
    ...options.queueOptions,
    connection,
    defaultJobOptions: options.defaultJobOptions ?? DEFAULT_JOB_OPTIONS,
  });
}
