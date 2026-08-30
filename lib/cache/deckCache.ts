import AsyncStorage from '@react-native-async-storage/async-storage';
import type { DeckMeta, DeckWithCards } from '../../types/deck';

const CATALOG_KEY = '@sso/decks/catalog';

function deckKey(deckId: string): string {
  return `@sso/decks/${deckId}`;
}

export type CatalogCacheMeta = {
  fetchedAt: number;
  decks: DeckMeta[];
};

export type DeckCacheMeta = {
  fetchedAt: number;
  updatedAt: string;
  deck: DeckWithCards;
};

export async function readCatalogCacheMeta(): Promise<CatalogCacheMeta | null> {
  try {
    const raw = await AsyncStorage.getItem(CATALOG_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as CatalogCacheMeta;
    if (!parsed.decks?.length) return null;
    return parsed;
  } catch {
    return null;
  }
}

export async function readCatalogCache(): Promise<DeckMeta[] | null> {
  const meta = await readCatalogCacheMeta();
  return meta?.decks ?? null;
}

export async function writeCatalogCache(decks: DeckMeta[]): Promise<void> {
  const payload: CatalogCacheMeta = { fetchedAt: Date.now(), decks };
  await AsyncStorage.setItem(CATALOG_KEY, JSON.stringify(payload));
}

export async function readDeckCacheMeta(deckId: string): Promise<DeckCacheMeta | null> {
  try {
    const raw = await AsyncStorage.getItem(deckKey(deckId));
    if (!raw) return null;
    const parsed = JSON.parse(raw) as DeckCacheMeta;
    if (!parsed.deck) return null;
    return parsed;
  } catch {
    return null;
  }
}

export async function readDeckCache(deckId: string): Promise<DeckWithCards | null> {
  const meta = await readDeckCacheMeta(deckId);
  return meta?.deck ?? null;
}

export async function writeDeckCache(deck: DeckWithCards): Promise<void> {
  const payload: DeckCacheMeta = {
    fetchedAt: Date.now(),
    updatedAt: deck.updatedAt,
    deck,
  };
  await AsyncStorage.setItem(deckKey(deck.deckId), JSON.stringify(payload));
}
