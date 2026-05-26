export interface ApiError {
  code: string;
  message: string;
  details?: unknown;
}

export interface ApiSuccessResponse<TData> {
  data: TData;
}

export interface ApiErrorResponse {
  error: ApiError;
}
