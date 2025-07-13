export const safeArray = <T,>(val?: T[] | null): T[] =>
  Array.isArray(val) ? val : [];
