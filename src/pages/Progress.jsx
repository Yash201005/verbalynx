import { useMemo } from "react";
import curriculum from "../../data/processed/curriculum/mandarin/curriculum.json";
import { getAllProgress } from "../utils/spacedRepetition";
import BackButton from "../components/BackButton";
<BackButton fallback="/" />
function Progress() {
  const progress = getAllProgress();

  const cards = useMemo(
    () =>
      curriculum.units.flatMap(
        (unit) => unit.vocabulary
      ),
    []
  );

  const stats = useMemo(() => {
    let learned = 0;
    let learning = 0;
    let mastered = 0;
    let due = 0;

    cards.forEach((card) => {
      const data = progress[card.id];

      if (!data) return;

      if (data.status === "learning") {
        learning++;
      }

      if (data.status === "review") {
        learned++;

        if (data.interval >= 21) {
          mastered++;
        }
      }

      if (new Date(data.due) <= new Date()) {
        due++;
      }
    });

    return {
      total: cards.length,
      learned,
      learning,
      mastered,
      due,
    };
  }, [cards, progress]);

  const percentage =
    stats.total > 0
      ? Math.round(
          (stats.learned / stats.total) * 100
        )
      : 0;

  return (
    <div className="progress-page">
      <div className="progress-header">
        <p>YOUR PROGRESS</p>
        <h1>Learning Progress</h1>
        <span>
          See how your Mandarin learning is developing.
        </span>
      </div>

      <div className="progress-overview">
        <div className="progress-main-card">
          <span>HSK 1</span>

          <strong>{percentage}%</strong>

          <p>of vocabulary reviewed</p>

          <div className="progress-bar">
            <div
              style={{
                width: `${percentage}%`,
              }}
            />
          </div>
        </div>

        <div className="progress-stat">
          <strong>{stats.learned}</strong>
          <span>Words learned</span>
        </div>

        <div className="progress-stat">
          <strong>{stats.learning}</strong>
          <span>Learning</span>
        </div>

        <div className="progress-stat">
          <strong>{stats.due}</strong>
          <span>Due for review</span>
        </div>

        <div className="progress-stat">
          <strong>{stats.mastered}</strong>
          <span>Mastered</span>
        </div>
      </div>

      <section className="progress-section">
        <div className="progress-section-header">
          <h2>HSK 1 Vocabulary</h2>
          <span>
            {stats.learned} / {stats.total}
          </span>
        </div>

        <div className="vocabulary-progress-list">
          {cards.slice(0, 30).map((card) => {
            const data = progress[card.id];

            const status = !data
              ? "New"
              : data.status === "learning"
                ? "Learning"
                : data.interval >= 21
                  ? "Mastered"
                  : "Review";

            return (
              <div
                className="vocabulary-progress-row"
                key={card.id}
              >
                <div>
                  <strong>{card.word}</strong>
                  <span>
                    {card.pronunciation?.pinyin}
                  </span>
                </div>

                <span
                  className={`progress-status ${status
                    .toLowerCase()
                    .replace(" ", "-")}`}
                >
                  {status}
                </span>
              </div>
            );
          })}
        </div>
      </section>
    </div>
  );
}

export default Progress;