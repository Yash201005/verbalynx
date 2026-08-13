const STORAGE_KEY = "verbalynx_learning_progress";

const INTERVALS = {
  again: 0,
  hard: 1,
  good: 3,
  easy: 7,
};

function loadProgress() {
  try {
    return JSON.parse(
      localStorage.getItem(STORAGE_KEY) || "{}"
    );
  } catch {
    return {};
  }
}

function saveProgress(progress) {
  localStorage.setItem(
    STORAGE_KEY,
    JSON.stringify(progress)
  );
}

export function getCardProgress(cardId) {
  const progress = loadProgress();

  return (
    progress[cardId] || {
      cardId,
      status: "new",
      repetitions: 0,
      interval: 0,
      ease: 2.5,
      due: new Date().toISOString(),
    }
  );
}

export function reviewCard(cardId, rating) {
  const progress = loadProgress();

  const current =
    progress[cardId] ||
    getCardProgress(cardId);

  const interval =
    INTERVALS[rating] ?? 0;

  let nextInterval = interval;

  if (rating === "again") {
    nextInterval = 0;
  }

  if (rating === "hard") {
    nextInterval = Math.max(
      1,
      Math.round(
        Math.max(current.interval, 1) * 1.5
      )
    );
  }

  if (rating === "good") {
    nextInterval = Math.max(
      3,
      Math.round(
        Math.max(current.interval, 1) *
          current.ease
      )
    );
  }

  if (rating === "easy") {
    nextInterval = Math.max(
      7,
      Math.round(
        Math.max(current.interval, 1) *
          current.ease *
          1.5
      )
    );
  }

  const due = new Date();

  if (nextInterval === 0) {
    due.setMinutes(
      due.getMinutes() + 10
    );
  } else {
    due.setDate(
      due.getDate() + nextInterval
    );
  }

  const updated = {
    cardId,
    status:
      rating === "again"
        ? "learning"
        : "review",
    repetitions:
      current.repetitions + 1,
    interval: nextInterval,
    ease:
      rating === "easy"
        ? Math.min(
            current.ease + 0.15,
            3.0
          )
        : rating === "hard"
          ? Math.max(
              current.ease - 0.15,
              1.3
            )
          : current.ease,
    due: due.toISOString(),
    lastReviewed:
      new Date().toISOString(),
    lastRating: rating,
  };

  progress[cardId] = updated;

  saveProgress(progress);

  return updated;
}

export function isCardDue(cardId) {
  const card = getCardProgress(cardId);

  return (
    new Date(card.due) <= new Date()
  );
}

export function getDueCards(cards) {
  return cards.filter((card) =>
    isCardDue(card.id)
  );
}

export function getAllProgress() {
  return loadProgress();
}