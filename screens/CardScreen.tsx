import type { ReactNode } from 'react';
import type { CardItem } from '../types/deck';
import Keep4Drop4 from '../components/cards/Keep4Drop4';
import Blind5Rank from '../components/cards/Blind5Rank';
import Budgeting4x5 from '../components/cards/Budgeting4x5';
import OpenQuestion from '../components/cards/OpenQuestion';
import Order4 from '../components/cards/Order4';
import RefreshableScrollView from '../components/common/RefreshableScrollView';

type Props = {
  card: CardItem;
  cardNumber: number;
  totalCards: number;
  deckId: string;
  onBack: () => void;
  onNext: () => void;
  dedupeKey?: string;
  onRefreshData?: () => Promise<void>;
  progressViewOffset?: number;
};

function withRefresh(
  content: ReactNode,
  dedupeKey?: string,
  onRefreshData?: () => Promise<void>,
  progressViewOffset?: number,
) {
  if (!dedupeKey || !onRefreshData) return content;
  return (
    <RefreshableScrollView
      dedupeKey={dedupeKey}
      onRefreshData={onRefreshData}
      progressViewOffset={progressViewOffset}
    >
      {content}
    </RefreshableScrollView>
  );
}

export default function CardScreen({
  card,
  cardNumber,
  totalCards,
  deckId,
  onBack,
  onNext,
  dedupeKey,
  onRefreshData,
  progressViewOffset,
}: Props) {
  const wrap = (node: ReactNode) =>
    withRefresh(node, dedupeKey, onRefreshData, progressViewOffset);

  if (card.type === 'KEEP_4_DROP_4') {
    return wrap(
      <Keep4Drop4
        card={card}
        onBack={onBack}
        onNext={onNext}
        cardNumber={cardNumber}
        totalCards={totalCards}
        deckId={deckId}
      />,
    );
  }

  if (card.type === 'BUDGETING_4x5') {
    return wrap(
      <Budgeting4x5
        card={card}
        onBack={onBack}
        onNext={onNext}
        cardNumber={cardNumber}
        totalCards={totalCards}
        deckId={deckId}
      />,
    );
  }

  if (card.type === 'BLIND_5_RANK') {
    return wrap(
      <Blind5Rank
        card={card}
        onBack={onBack}
        onNext={onNext}
        cardNumber={cardNumber}
        totalCards={totalCards}
        deckId={deckId}
      />,
    );
  }

  if (card.type === 'OPEN_QUESTION') {
    return wrap(
      <OpenQuestion
        card={card}
        onBack={onBack}
        onNext={onNext}
        cardNumber={cardNumber}
        totalCards={totalCards}
        deckId={deckId}
      />,
    );
  }

  if (card.type === 'ORDER_4') {
    return wrap(
      <Order4
        card={card}
        onBack={onBack}
        onNext={onNext}
        cardNumber={cardNumber}
        totalCards={totalCards}
        deckId={deckId}
      />,
    );
  }

  return null;
}
