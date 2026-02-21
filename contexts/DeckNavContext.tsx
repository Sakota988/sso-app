import { createContext, useContext } from 'react';
import type { Deck } from '../screens/DecksScreen';

type DeckNavContextType = {
  openDeck: (deck: Deck) => void;
};

export const DeckNavContext = createContext<DeckNavContextType>({
  openDeck: () => {},
});

export const useDeckNav = () => useContext(DeckNavContext);
