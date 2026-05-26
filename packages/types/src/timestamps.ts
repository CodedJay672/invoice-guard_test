export interface TimestampFields {
  createdAt: string;
  updatedAt: string;
}

export interface SoftDeleteTimestampFields {
  deletedAt: string | null;
}
