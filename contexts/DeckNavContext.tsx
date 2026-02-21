import { createContext, useContext } from 'react';
import type { DeckDisplay } from '../types/deck';

type DeckNavContextType = {
  openDeck: (deck: DeckDisplay) => void;
};

export const DeckNavContext = createContext<DeckNavContextType>({
  openDeck: () => {},
});

export const useDeckNav = () => useContext(DeckNavContext);
