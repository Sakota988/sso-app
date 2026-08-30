import type { ImageSourcePropType } from 'react-native';
import type { DeckDisplay, DeckMeta } from '../../types/deck';

const DECK_IMAGES: Record<string, ImageSourcePropType> = {
  'deck-1': require('../../assets/decks_backs/deck_4_back.png'),
  'deck-2': require('../../assets/decks_backs/deck_5_back.png'),
  'deck-3': require('../../assets/decks_backs/deck_6_back.png'),
  'deck-4': require('../../assets/decks_backs/deck_2_back.png'),
  'deck-5': require('../../assets/decks_backs/deck_7_back.png'),
};

const FALLBACK_IMAGE: ImageSourcePropType = require('../../assets/decks_backs/deck_1_back.png');

export function resolveCoverSource(deck: Pick<DeckMeta, 'deckId' | 'coverImageUrl'>): ImageSourcePropType {
  if (deck.coverImageUrl) {
    return { uri: deck.coverImageUrl };
  }
  return DECK_IMAGES[deck.deckId] ?? FALLBACK_IMAGE;
}

export function toDeckDisplay(deck: DeckMeta): DeckDisplay {
  return {
    ...deck,
    coverSource: resolveCoverSource(deck),
  };
}
