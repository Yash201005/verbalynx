import { useMemo, useState } from "react";
import ReviewCard from "../components/ReviewCard";
import curriculum from "../../data/processed/curriculum/mandarin/curriculum.json";
import { getDueCards } from "../utils/spacedRepetition";
import BackButton from "../components/BackButton";
<BackButton fallback="/" />
function Review() {
  const [completed, setCompleted] = useState([]);
  const [refresh, setRefresh] = useState(0);

  const dueCards = useMemo(() => {
    const cards = curriculum.units.flatMap(
      (unit) => unit.vocabulary
    );

    return getDueCards(cards).filter(
      (card) => !completed.includes(card.id)
    );
  }, [completed, refresh]);

  const handleComplete = (card) => {
    setCompleted((current) => [
      ...current,
      card.cardId,
    ]);

    setRefresh((value) => value + 1);
  };
    
  return (
    <div className="review-page">
      <div className="review-page-header">
        <p className="review-eyebrow">
          DAILY REVIEW
        </p>

        <h1>Review</h1>

        <p>
          Strengthen the words you've learned.
        </p>
      </div>

      {dueCards.length === 0 ? (
        <div className="review-empty">
          <div className="review-empty-icon">
            ✓
          </div>

          <h2>You're all caught up.</h2>

          <p>
            No vocabulary is due for review right now.
          </p>
        </div>
      ) : (
        <div className="review-session">
          <div className="review-count">
            {dueCards.length}{" "}
            {dueCards.length === 1
              ? "word"
              : "words"}{" "}
            remaining
          </div>

          <ReviewCard
            key={`${dueCards[0].id}-${refresh}`}
            vocabulary={dueCards[0]}
            onComplete={handleComplete}
          />
        </div>
      )}
    </div>
  );
}

export default Review;