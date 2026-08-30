import { readCatalogCache, writeCatalogCache } from '../cache/deckCache';
import { toDeckDisplay } from '../decks/coverSource';
import type { DeckDisplay } from '../../types/deck';
import { fetchDecks } from './decks';

export type LoadDecksResult = {
  decks: DeckDisplay[];
  fromCache: boolean;
};

export async function loadDecks(): Promise<LoadDecksResult> {
  try {
    const decks = await fetchDecks();
    await writeCatalogCache(decks);
    return { decks: decks.map(toDeckDisplay), fromCache: false };
  } catch {
    const cached = await readCatalogCache();
    if (cached?.length) {
      return { decks: cached.map(toDeckDisplay), fromCache: true };
    }
    throw new Error('Nije moguće učitati špilove. Proveri da li backend radi.');
  }
}

export async function refreshDecks(): Promise<LoadDecksResult> {
  try {
    const decks = await fetchDecks();
    await writeCatalogCache(decks);
    return { decks: decks.map(toDeckDisplay), fromCache: false };
  } catch {
    const cached = await readCatalogCache();
    if (cached?.length) {
      return { decks: cached.map(toDeckDisplay), fromCache: true };
    }
    throw new Error('Nije moguće osvežiti špilove.');
  }
}
