import type { DeckContent } from '../types/deck';

// Metro bundler requires static require() calls — no dynamic imports.
// Add a new entry here whenever you add a new deck content file.
const REGISTRY: Record<string, DeckContent> = {
  'sva-pitanja-1.json':    require('./sva-pitanja-1.json'),
  'sva-pitanja-2.json':    require('./sva-pitanja-2.json'),
  'sva-pitanja-3.json':    require('./sva-pitanja-3.json'),
};

export function getCardFile(contentFile: string): DeckContent | null {
  return REGISTRY[contentFile] ?? null;
}
