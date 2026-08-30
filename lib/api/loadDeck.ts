import { readDeckCache, writeDeckCache } from '../cache/deckCache';
import type { DeckWithCards } from '../../types/deck';
import { fetchDeck } from './decks';

export type LoadDeckResult = {
  deck: DeckWithCards;
  fromCache: boolean;
};

export async function loadDeck(deckId: string): Promise<LoadDeckResult> {
  try {
    const deck = await fetchDeck(deckId);
    await writeDeckCache(deck);
    return { deck, fromCache: false };
  } catch {
    const cached = await readDeckCache(deckId);
    if (cached) {
      return { deck: cached, fromCache: true };
    }
    throw new Error('Nije moguće učitati kartice. Proveri da li backend radi.');
  }
}

export async function refreshDeck(deckId: string): Promise<LoadDeckResult> {
  try {
    const deck = await fetchDeck(deckId);
    await writeDeckCache(deck);
    return { deck, fromCache: false };
  } catch {
    const cached = await readDeckCache(deckId);
    if (cached) {
      return { deck: cached, fromCache: true };
    }
    throw new Error('Nije moguće osvežiti kartice.');
  }
}
