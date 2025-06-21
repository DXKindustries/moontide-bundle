
export type ParsedInput = {
  type: 'zip' | 'cityState' | 'cityStateZip';
  zipCode?: string;
  city?: string;
  state?: string;
};

export const parseLocationInput = (input: string): ParsedInput | null => {
  const trimmed = input.trim();
  
  // ZIP code only (5 digits)
  if (/^\d{5}$/.test(trimmed)) {
    return { type: 'zip', zipCode: trimmed };
  }
  
  // City, State ZIP (e.g., "Newport, RI 02840" OR "Newport RI 02840")
  const cityStateZipMatch = trimmed.match(/^(.+?)(?:,\s*|\s+)([A-Za-z]{2})\s+(\d{5})$/);
  if (cityStateZipMatch) {
    return {
      type: 'cityStateZip',
      city: cityStateZipMatch[1].trim(),
      state: cityStateZipMatch[2].toUpperCase(),
      zipCode: cityStateZipMatch[3]
    };
  }
  
  // City, State (e.g., "Newport, RI" OR "Newport RI")
  const cityStateMatch = trimmed.match(/^(.+?)(?:,\s*|\s+)([A-Za-z]{2})$/);
  if (cityStateMatch) {
    return {
      type: 'cityState',
      city: cityStateMatch[1].trim(),
      state: cityStateMatch[2].toUpperCase()
    };
  }
  
  return null;
};
