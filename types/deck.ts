// ── Deck manifest ────────────────────────────────────────────────
export type DeckMeta = {
  deckId: string;
  title: string;
  description: string;
  isFree: boolean;
  productId: string | null;
  cardCount: number;
  contentFile: string;
};

// Deck enriched with local assets for display
export type DeckDisplay = DeckMeta & {
  image: ReturnType<typeof require>;
};

// ── Card types ────────────────────────────────────────────────────
export type Keep4Drop4Card = {
  cardId: string;
  type: 'KEEP_4_DROP_4';
  title: string;
  description: string;
  traits: string[];
};

export type Blind5RankCard = {
  cardId: string;
  type: 'BLIND_5_RANK';
  title: string;
  description: string;
  items: string[];
  labels: { rank1: string; rank5: string };
};

export type BudgetCategory = {
  categoryId: string;
  title: string;
  options: { label: string; cost: number }[];
};

export type Budgeting4x5Card = {
  cardId: string;
  type: 'BUDGETING_4x5';
  title: string;
  description: string;
  budgetTotal: number;
  categories: BudgetCategory[];
};

export type CardItem = Keep4Drop4Card | Blind5RankCard | Budgeting4x5Card;

export type DeckContent = {
  deckId: string;
  cards: CardItem[];
};
