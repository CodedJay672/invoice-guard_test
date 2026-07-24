export interface LogContext {
  requestId?: string;
  jobId?: string;
  module?: string;
  action?: string;
  event?: string;
  userId?: string;
  organizationId?: string;
}
