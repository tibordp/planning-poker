// Deterministic stub for the ESM-only uuid package, used by the test runner.
let counter = 0;
export const v4 = (): string => `00000000-0000-0000-0000-${String(counter++).padStart(12, "0")}`;
