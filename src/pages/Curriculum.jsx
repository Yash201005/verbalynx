import { Link, useParams } from "react-router-dom";
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

        <div className="lesson-not-found">
          <h1>Language not found</h1>

          <p>
            This language does not exist in
            VerbaLynx.
          </p>
        </div>
      </div>
    );
  }

  const curriculum = language.curriculum;

  if (!curriculum) {
    return (
      <div className="curriculum-page">
        <BackButton
          fallback={`/languages/${languageId}`}
        />

        <div className="lesson-not-found">
          <h1>Curriculum unavailable</h1>

          <p>
            A curriculum has not been connected
            to this language yet.
          </p>
        </div>
      </div>
    );
  }

  const isMandarin =
    languageId === "mandarin";

  return (
    <div className="curriculum-page">
      <BackButton
        fallback={`/languages/${languageId}`}
      />

      <div className="curriculum-header">
        <p className="curriculum-eyebrow">
          {language.name.toUpperCase()}
        </p>

        <h1>{curriculum.level}</h1>

        <p>
          {isMandarin
            ? "Build your Mandarin vocabulary through structured lessons and real examples."
            : `Build your ${language.name} through structured lessons and practice.`}
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
                  UNIT{" "}
                  {unit.unitNumber ||
                    unit.id}
                </span>

                <h2>{unit.title}</h2>

                {unit.description && (
                  <p>
                    {unit.description}
                  </p>
                )}
              </div>

              {isMandarin ? (
                <p>
                  {unit.vocabulary.length} words
                </p>
              ) : (
                <p>
                  {unit.lessons?.length || 0} lessons
                </p>
              )}
            </div>

            <div className="unit-lessons">
              {isMandarin ? (
                unit.vocabulary.map(
                  (word, index) => (
                    <Link
                      key={word.id}
                      to={`/languages/${languageId}/lesson/${unit.id}-l${
                        index + 1
                      }`}
                      className="curriculum-lesson"
                    >
                      <span className="lesson-number">
                        {String(
                          index + 1
                        ).padStart(2, "0")}
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
                )
              ) : (
                unit.lessons?.map(
                  (lesson, index) => (
                    <Link
                      key={lesson.id}
                      to={`/languages/${languageId}/lesson/${lesson.id}`}
                      className="curriculum-lesson"
                    >
                      <span className="lesson-number">
                        {String(
                          index + 1
                        ).padStart(2, "0")}
                      </span>

                      <div className="lesson-info">
                        <strong>
                          {lesson.title}
                        </strong>

                        <span>
                          {lesson.type}
                        </span>
                      </div>

                      <span className="lesson-meaning">
                        {lesson.duration} min
                      </span>

                      <span className="lesson-arrow">
                        →
                      </span>
                    </Link>
                  )
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