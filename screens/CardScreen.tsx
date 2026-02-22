import type { CardItem } from '../types/deck';
import Keep4Drop4 from '../components/cards/Keep4Drop4';
import Blind5Rank from '../components/cards/Blind5Rank';
import Budgeting4x5 from '../components/cards/Budgeting4x5';

type Props = {
  card: CardItem;
  cardNumber: number;
  totalCards: number;
  onBack: () => void;
};

// ── Main screen ───────────────────────────────────────────────────
export default function CardScreen({ card, cardNumber, totalCards, onBack }: Props) {
  // These card types own the full screen (their own chrome + layout)
  if (card.type === 'KEEP_4_DROP_4') {
    return (
      <Keep4Drop4
        card={card}
        onBack={onBack}
        cardNumber={cardNumber}
        totalCards={totalCards}
      />
    );
  }

  if (card.type === 'BUDGETING_4x5') {
    return (
      <Budgeting4x5
        card={card}
        onBack={onBack}
        cardNumber={cardNumber}
        totalCards={totalCards}
      />
    );
  }

  if (card.type === 'BLIND_5_RANK') {
    return (
      <Blind5Rank
        card={card}
        onBack={onBack}
        cardNumber={cardNumber}
        totalCards={totalCards}
      />
    );
  }

  return null;
}
