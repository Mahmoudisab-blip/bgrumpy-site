export function normalizeText(text: string): string {
  return text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[’']/g, " ")
    .replace(/[^a-z0-9\s-]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

export function tokenizeText(text: string): string[] {
  return normalizeText(text)
    .split(/\s+/)
    .filter((token) => token.length >= 3);
}

export function containsAny(text: string, words: string[]): boolean {
  const normalizedText = normalizeText(text);

  return words.some((word) => normalizedText.includes(normalizeText(word)));
}

export function calculateSimilarity(a: string, b: string): number {
  const firstTokens = new Set(tokenizeText(a));
  const secondTokens = new Set(tokenizeText(b));

  if (!firstTokens.size || !secondTokens.size) {
    return 0;
  }

  const shared = [...firstTokens].filter((token) => secondTokens.has(token)).length;
  const total = new Set([...firstTokens, ...secondTokens]).size;

  return shared / total;
}
