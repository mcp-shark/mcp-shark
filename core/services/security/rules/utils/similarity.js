import { normalizeName } from './text.js';

function bigramSet(text) {
  const normalized = normalizeName(text);
  if (normalized.length < 2) {
    return new Set([normalized]);
  }
  const indices = Array.from({ length: normalized.length - 1 }, (_, i) => i);
  const grams = new Set(indices.map((i) => normalized.slice(i, i + 2)));
  return grams;
}

function diceCoefficient(a, b) {
  const setA = bigramSet(a);
  const setB = bigramSet(b);
  if (!setA.size || !setB.size) {
    return 0;
  }
  const overlap = Array.from(setA).filter((gram) => setB.has(gram)).length;
  return (2 * overlap) / (setA.size + setB.size);
}

function computeLevenshteinRow(prevRow, aIndex, a, b) {
  const initial = aIndex + 1;
  return b.split('').reduce(
    (acc, bChar, j) => {
      const substitutionCost = a[aIndex] === bChar ? 0 : 1;
      const val = Math.min(prevRow[j + 1] + 1, acc.prev + 1, prevRow[j] + substitutionCost);
      acc.row.push(val);
      acc.prev = val;
      return acc;
    },
    { row: [initial], prev: initial }
  ).row;
}

function levenshtein(a = '', b = '') {
  const initialRow = Array.from({ length: b.length + 1 }, (_, i) => i);
  const finalRow = a
    .split('')
    .reduce((prevRow, _, aIndex) => computeLevenshteinRow(prevRow, aIndex, a, b), initialRow);
  return finalRow[b.length] ?? 0;
}

export function hybridSimilarityScore(a, b) {
  const cleanA = normalizeName(a);
  const cleanB = normalizeName(b);
  if (!cleanA || !cleanB) {
    return 0;
  }

  const maxLen = Math.max(cleanA.length, cleanB.length);
  const lev = levenshtein(cleanA, cleanB);
  const levScore = maxLen === 0 ? 1 : (maxLen - lev) / maxLen;
  const dice = diceCoefficient(cleanA, cleanB);

  const tokenSet = diceCoefficient(
    cleanA.split(/\s+/).sort().join(' '),
    cleanB.split(/\s+/).sort().join(' ')
  );

  const weighted = levScore * 0.45 + dice * 0.35 + tokenSet * 0.2;

  return Math.round(weighted * 100);
}
