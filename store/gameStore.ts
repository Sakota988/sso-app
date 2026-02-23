import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';

// ── Per-type result shapes ────────────────────────────────────────

export type Keep4Drop4Result = {
  type: 'KEEP_4_DROP_4';
  cardId: string;
  deckId: string;
  cardTitle: string;
  kept: string[];
  dropped: string[];
  playedAt: number;
};

export type Blind5RankResult = {
  type: 'BLIND_5_RANK';
  cardId: string;
  deckId: string;
  cardTitle: string;
  ranks: Record<string, number>;       // item → rank (1–5)
  labels: { rank1: string; rank5: string };
  playedAt: number;
};

export type Budgeting4x5Result = {
  type: 'BUDGETING_4x5';
  cardId: string;
  deckId: string;
  cardTitle: string;
  selections: Record<string, { label: string; cost: number; auto?: boolean }>;
  spent: number;
  budgetTotal: number;
  playedAt: number;
};

export type OpenQuestionResult = {
  type: 'OPEN_QUESTION';
  cardId: string;
  deckId: string;
  cardTitle: string;
  userAnswer: string;
  matched: boolean;
  playedAt: number;
};

export type CardResult = Keep4Drop4Result | Blind5RankResult | Budgeting4x5Result | OpenQuestionResult;

// ── Store ─────────────────────────────────────────────────────────

type GameStore = {
  /** Map of cardId → latest completed result for that card */
  results: Record<string, CardResult>;
  saveResult: (result: CardResult) => void;
  clearAll: () => void;
};

export const useGameStore = create<GameStore>()(
  persist(
    (set) => ({
      results: {},
      saveResult: (result) =>
        set((state) => ({
          results: { ...state.results, [result.cardId]: result },
        })),
      clearAll: () => set({ results: {} }),
    }),
    {
      name: 'sso-game-results',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);

