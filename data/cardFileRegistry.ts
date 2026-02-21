import type { DeckContent } from '../types/deck';

// Metro bundler requires static require() calls — no dynamic imports.
// Add a new entry here whenever you add a new deck content file.
const REGISTRY: Record<string, DeckContent> = {
  'deck-starter.json':    require('./deck-starter.json'),
  'deck-red-flags.json':  require('./deck-red-flags.json'),
};

export function getCardFile(contentFile: string): DeckContent | null {
  return REGISTRY[contentFile] ?? null;
}
