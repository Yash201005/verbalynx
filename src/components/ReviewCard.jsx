import { useState } from "react";
import {
  reviewCard,
  getCardProgress,
} from "../utils/spacedRepetition";

function ReviewCard({ vocabulary, onComplete }) {
  const [showAnswer, setShowAnswer] =
    useState(false);

  const progress = getCardProgress(
    vocabulary.id
  );

  const handleReview = (rating) => {
    const updated = reviewCard(
      vocabulary.id,
      rating
    );

    onComplete?.(updated);

    setShowAnswer(false);
  };

  return (
    <div className="review-card">
      <div className="review-card-header">
        <span>REVIEW</span>

        <small>
          {progress.repetitions} reviews
        </small>
      </div>

      <div className="review-question">
        <span className="review-label">
          What does this mean?
        </span>

        <h2>{vocabulary.word}</h2>

        <p>
          {vocabulary.pronunciation?.pinyin}
        </p>

        <button
          className="review-audio"
          onClick={() => {
            const utterance =
              new SpeechSynthesisUtterance(
                vocabulary.word
              );

            utterance.lang = "zh-CN";
            utterance.rate = 0.7;

            speechSynthesis.cancel();
            speechSynthesis.speak(
              utterance
            );
          }}
        >
          🔊 Listen
        </button>
      </div>

      {!showAnswer ? (
        <button
          className="show-answer-button"
          onClick={() =>
            setShowAnswer(true)
          }
        >
          Show answer
        </button>
      ) : (
        <div className="review-answer">
          <span className="review-label">
            MEANING
          </span>

          <h3>
            {vocabulary.meaning}
          </h3>

          {vocabulary.examples?.[0] && (
            <div className="review-example">
              <p>
                {
                  vocabulary.examples[0]
                    .text
                }
              </p>

              <span>
                {
                  vocabulary.examples[0]
                    .translation
                }
              </span>
            </div>
          )}

          <div className="review-actions">
            <button
              onClick={() =>
                handleReview("again")
              }
            >
              Again
              <small>10 min</small>
            </button>

            <button
              onClick={() =>
                handleReview("hard")
              }
            >
              Hard
              <small>1 day</small>
            </button>

            <button
              onClick={() =>
                handleReview("good")
              }
            >
              Good
              <small>3 days</small>
            </button>

            <button
              onClick={() =>
                handleReview("easy")
              }
            >
              Easy
              <small>7 days</small>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default ReviewCard;