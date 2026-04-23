
export const PROTECTED_ACRONYMS = [
  'FSM', 'SAP', 'EBM', 'BI', 'GAC', 'SIATC', 'OPEX', 'YTD', 
  'PEN', 'USD', 'ID', 'URL', 'KPI', 'D3', 'PDF', 'IMG'
];

export const CONNECTORS = [
  'de', 'del', 'con', 'en', 'no', 'para', 'por', 'y', 'o', 'a', 
  'la', 'el', 'los', 'las'
];

/**
 * Formats a given string into Title Case while preserving acronyms in Uppercase
 * and connectors in Lowercase.
 */
export function uiTitleCase(text: string): string {
  if (!text) return '';

  return text
    .toLowerCase()
    .split(/[\s_-]+/) // Split by space, underscore or hyphen
    .map((word, index) => {
      const upperWord = word.toUpperCase();

      // Rule 1: Always keep protected acronyms in Uppercase
      if (PROTECTED_ACRONYMS.includes(upperWord)) {
        return upperWord;
      }

      // Rule 2: Keep connectors in Lowercase (except if it's the first word)
      if (CONNECTORS.includes(word.toLowerCase()) && index !== 0) {
        return word.toLowerCase();
      }

      // Rule 3: Regular words in Title Case
      return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();
    })
    .join(' ');
}
