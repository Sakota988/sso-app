import type { CardItem, DeckMeta, DeckWithCards } from '../../types/deck';
import { apiRequest } from './client';

type DeckDetailResponse = DeckMeta & {
  cards: CardItem[];
};

function normalizeCard(raw: CardItem): CardItem {
  if (raw.cardId) {
    return raw;
  }
  return { ...raw, cardId: (raw as CardItem & { slug?: string }).slug ?? 'unknown' };
}

export async function checkHealth(): Promise<boolean> {
  try {
    const data = await apiRequest<{ status: string }>({ path: '/health' });
    return data.status === 'ok';
  } catch {
    return false;
  }
}

export async function fetchDecks(): Promise<DeckMeta[]> {
  return apiRequest<DeckMeta[]>({ path: '/v1/decks' });
}

export async function fetchDeck(deckId: string): Promise<DeckWithCards> {
  const data = await apiRequest<DeckDetailResponse>({
    path: `/v1/decks/${encodeURIComponent(deckId)}`,
  });
  return {
    deckId: data.deckId,
    title: data.title,
    description: data.description,
    isFree: data.isFree,
    productId: data.productId,
    cardCount: data.cardCount,
    coverImageUrl: data.coverImageUrl,
    updatedAt: data.updatedAt,
    cards: (data.cards ?? []).map(normalizeCard),
  };
}
