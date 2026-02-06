export const DURATION_KEYS = ["week", "month", "year", "forever"] as const;
export type DurationKey = (typeof DURATION_KEYS)[number];
