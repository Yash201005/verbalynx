import { Link, useParams } from "react-router-dom";
import { ArrowRight, Clock, Lock, Check } from "lucide-react";

import { languages } from "../data/languages";
import BackButton from "../components/BackButton";

function Curriculum() {
  const { languageId } = useParams();

  const language = languages.find(
    (item) => item.id === languageId
  );

  if (!language) {
    return (
      <div className="curriculum-page">
        <BackButton fallback="/languages" />
        <h1>Language not found</h1>
      </div>
    );
  }

  const curriculum = language.curriculum;

  return (
    <div className="curriculum-page">
      <BackButton fallback={`/languages/${languageId}`} />

      <header className="curriculum-header">
        <div>
          <p className="section-label">
            {language.name.toUpperCase()}
          </p>

          <h1>{curriculum.level}</h1>

          <p>
            Follow your learning path one step at a time.
          </p>
        </div>
      </header>

      <div className="curriculum-units">
        {curriculum.units.map((unit, unitIndex) => (
          <section
            key={unit.id}
            className="curriculum-unit"
          >
            <div className="unit-number">
              {String(unitIndex + 1).padStart(2, "0")}
            </div>

            <div className="unit-content">
              <div className="unit-header">
                <div>
                  <h2>{unit.title}</h2>

                  <p>{unit.description}</p>
                </div>

                <span className="unit-status">
                  {unitIndex === 0
                    ? "CURRENT"
                    : "UP NEXT"}
                </span>
              </div>

              <div className="lesson-list">
                {unit.lessons.map(
                  (lesson, lessonIndex) => {
                    const isCurrent =
                      unitIndex === 0 &&
                      lessonIndex === 0;

                    return (
                      <Link
                        key={lesson.id}
                        to={`/languages/${languageId}/lesson/${lesson.id}`}
                        className={`lesson-row ${
                          isCurrent
                            ? "lesson-current"
                            : ""
                        }`}
                      >
                        <div className="lesson-icon">
                          {isCurrent ? (
                            <Check size={14} />
                          ) : (
                            <span>
                              {lessonIndex + 1}
                            </span>
                          )}
                        </div>

                        <div className="lesson-info">
                          <strong>
                            {lesson.title}
                          </strong>

                          <span>
                            {lesson.type}
                          </span>
                        </div>

                        <div className="lesson-duration">
                          <Clock size={13} />
                          {lesson.duration} min
                        </div>

                        <ArrowRight
                          size={14}
                          className="lesson-arrow"
                        />
                      </Link>
                    );
                  }
                )}
              </div>
            </div>
          </section>
        ))}
      </div>
    </div>
  );
}

export default Curriculum;