import { Link } from "react-router-dom";
import curriculum from "../../data/processed/curriculum/mandarin/curriculum.json";

function Curriculum() {
  return (
    <div className="curriculum-page">
      <div className="curriculum-header">
        <p className="curriculum-eyebrow">
          MANDARIN
        </p>

        <h1>{curriculum.level}</h1>

        <p>
          Build your Mandarin vocabulary through
          structured lessons and real examples.
        </p>
      </div>

      <div className="curriculum-units">
        {curriculum.units.map((unit) => (
          <section
            className="curriculum-unit"
            key={unit.id}
          >
            <div className="unit-header">
              <div>
                <span>
                  UNIT {unit.unitNumber}
                </span>

                <h2>{unit.title}</h2>
              </div>

              <p>
                {unit.vocabulary.length} words
              </p>
            </div>

            <div className="unit-lessons">
              {unit.vocabulary.map(
                (word, index) => (
                  <Link
                    key={word.id}
                    to={`/languages/mandarin/lesson/${unit.id}-l${
                      index + 1
                    }`}
                    className="curriculum-lesson"
                  >
                    <span className="lesson-number">
                      {String(index + 1).padStart(
                        2,
                        "0"
                      )}
                    </span>

                    <div className="lesson-info">
                      <strong>
                        {word.word}
                      </strong>

                      <span>
                        {
                          word.pronunciation
                            ?.pinyin
                        }
                      </span>
                    </div>

                    <span className="lesson-meaning">
                      {word.meaning}
                    </span>

                    <span className="lesson-arrow">
                      →
                    </span>
                  </Link>
                )
              )}
            </div>
          </section>
        ))}
      </div>
    </div>
  );
}

export default Curriculum;