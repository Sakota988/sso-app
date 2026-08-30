import type { ImageSourcePropType } from 'react-native';

// ── Deck manifest (from API) ─────────────────────────────────────
export type DeckMeta = {
  deckId: string;
  title: string;
  description: string;
  isFree: boolean;
  productId: string | null;
  cardCount: number;
  coverImageUrl: string | null;
  updatedAt: string;
};

// Deck enriched for display (remote URI or local require fallback)
export type DeckDisplay = DeckMeta & {
  coverSource: ImageSourcePropType;
};

export type DeckWithCards = DeckMeta & {
  cards: CardItem[];
};

// ── Card types ────────────────────────────────────────────────────
export type Keep4Drop4Card = {
  cardId: string;
  type: 'KEEP_4_DROP_4';
  title: string;
  shortTitle: string;
  description: string;
  traits: string[];
};

export type Blind5RankCard = {
  cardId: string;
  type: 'BLIND_5_RANK';
  title: string;
  shortTitle: string;
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
  shortTitle: string;
  description: string;
  budgetTotal: number;
  categories: BudgetCategory[];
};

export type OpenQuestionAnswer = {
  title: string;
  description: string;
  sourceUrl?: string;
};

export type OpenQuestionCard = {
  cardId: string;
  type: 'OPEN_QUESTION';
  title: string;
  shortTitle: string;
  description: string;
  question: string;
  acceptedAnswers: string[];
  answer: OpenQuestionAnswer;
};

export type Order4Card = {
  cardId: string;
  type: 'ORDER_4';
  title: string;
  shortTitle: string;
  description: string;
  question: string;
  items: [string, string, string, string];
  correctOrder: [string, string, string, string];
  answer: {
    title: string;
    description: string;
    sourceUrl?: string;
  };
};

export type CardItem = Keep4Drop4Card | Blind5RankCard | Budgeting4x5Card | OpenQuestionCard | Order4Card;

export type DeckContent = {
  deckId: string;
  cards: CardItem[];
};
