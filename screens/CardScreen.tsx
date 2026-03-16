import type { CardItem } from '../types/deck';
import Keep4Drop4 from '../components/cards/Keep4Drop4';
import Blind5Rank from '../components/cards/Blind5Rank';
import Budgeting4x5 from '../components/cards/Budgeting4x5';
import OpenQuestion from '../components/cards/OpenQuestion';
import Order4 from '../components/cards/Order4';

type Props = {
  card: CardItem;
  cardNumber: number;
  totalCards: number;
  deckId: string;
  onBack: () => void;
  onNext: () => void;
};

// ── Main screen ───────────────────────────────────────────────────
export default function CardScreen({ card, cardNumber, totalCards, deckId, onBack, onNext }: Props) {
  if (card.type === 'KEEP_4_DROP_4') {
    return (
      <Keep4Drop4
        card={card}
        onBack={onBack}
        onNext={onNext}
        cardNumber={cardNumber}
        totalCards={totalCards}
        deckId={deckId}
      />
    );
  }

  if (card.type === 'BUDGETING_4x5') {
    return (
      <Budgeting4x5
        card={card}
        onBack={onBack}
        onNext={onNext}
        cardNumber={cardNumber}
        totalCards={totalCards}
        deckId={deckId}
      />
    );
  }

  if (card.type === 'BLIND_5_RANK') {
    return (
      <Blind5Rank
        card={card}
        onBack={onBack}
        onNext={onNext}
        cardNumber={cardNumber}
        totalCards={totalCards}
        deckId={deckId}
      />
    );
  }

  if (card.type === 'OPEN_QUESTION') {
    return (
      <OpenQuestion
        card={card}
        onBack={onBack}
        onNext={onNext}
        cardNumber={cardNumber}
        totalCards={totalCards}
        deckId={deckId}
      />
    );
  }

  if (card.type === 'ORDER_4') {
    return (
      <Order4
        card={card}
        onBack={onBack}
        onNext={onNext}
        cardNumber={cardNumber}
        totalCards={totalCards}
        deckId={deckId}
      />
    );
  }

  return null;
}
