import { useParams } from "react-router-dom";
import { ArrowLeft, ArrowRight, Volume2 } from "lucide-react";

import { languages } from "../data/languages";
import BackButton from "../components/BackButton";

import { englishA1Vocabulary } from "../data/content/english/vocabulary/a1";
import { mandarinHSK1Vocabulary } from "../data/content/mandarin/vocabulary/hsk1";
import { japaneseN5Vocabulary } from "../data/content/japanese/vocabulary/n5";

const vocabularyContent = {
  english: englishA1Vocabulary,
  mandarin: mandarinHSK1Vocabulary,
  japanese: japaneseN5Vocabulary,
};

function Lesson() {
  const { languageId, lessonId } = useParams();

  const language = languages.find(
    (item) => item.id === languageId
  );

  if (!language) {
    return (
      <div className="lesson-page">
        <BackButton fallback="/languages" />
        <h1>Language not found</h1>
      </div>
    );
  }

  const allLessons = language.curriculum.units.flatMap(
    (unit) => unit.lessons
  );

  const lesson = allLessons.find(
    (item) => item.id === lessonId
  );

  if (!lesson) {
    return (
      <div className="lesson-page">
        <BackButton
          fallback={`/languages/${languageId}/curriculum`}
        />
        <h1>Lesson not found</h1>
      </div>
    );
  }

  const vocabulary =
    lesson.type === "vocabulary"
      ? vocabularyContent[languageId] || []
      : [];

  return (
    <div className="lesson-page">
      <div className="lesson-top">
        <BackButton
          fallback={`/languages/${languageId}/curriculum`}
        />

        <div className="lesson-progress">
          <span>LESSON 1</span>

          <div className="lesson-progress-track">
            <div className="lesson-progress-fill" />
          </div>

          <span>1 / 5</span>
        </div>
      </div>

      <header className="lesson-heading">
        <div>
          <p>{lesson.type.toUpperCase()}</p>

          <h1>{lesson.title}</h1>

          <span>
            {language.name} · {language.level}
          </span>
        </div>
      </header>

      {lesson.type === "vocabulary" && (
        <div className="vocabulary-list">
          {vocabulary.map((item, index) => (
            <article
              key={item.id}
              className="vocabulary-card"
            >
              <div className="vocabulary-number">
                {String(index + 1).padStart(2, "0")}
              </div>

              <div className="vocabulary-content">
                <div className="vocabulary-word-row">
                  <div>
                    <h2>{item.word}</h2>

                    {item.pronunciation?.romanization && (
                      <p className="romanization">
                        {item.pronunciation.romanization}
                      </p>
                    )}

                    {item.pronunciation?.kana && (
                      <p className="romanization">
                        {item.pronunciation.kana}
                      </p>
                    )}

                    {item.pronunciation?.ipa && (
                      <p className="ipa">
                        {item.pronunciation.ipa}
                      </p>
                    )}

                    {item.pronunciation?.tones && (
                      <p className="tones">
                        Tones{" "}
                        {item.pronunciation.tones.join(" · ")}
                      </p>
                    )}
                  </div>

                  <button
                    type="button"
                    className="pronunciation-button"
                    aria-label={`Play pronunciation of ${item.word}`}
                  >
                    <Volume2 size={17} />
                  </button>
                </div>

                <div className="vocabulary-meaning">
                  <span>MEANING</span>
                  <p>{item.meaning}</p>
                </div>

                <div className="vocabulary-example">
                  <span>EXAMPLE</span>

                  <strong>
                    {item.examples?.[0]?.text}
                  </strong>

                  {item.examples?.[0]?.translation && (
                    <p>
                      {item.examples[0].translation}
                    </p>
                  )}
                </div>

                <div className="vocabulary-usage">
                  <span>USAGE</span>
                  <p>{item.usage}</p>
                </div>
              </div>
            </article>
          ))}
        </div>
      )}

      {lesson.type !== "vocabulary" && (
        <div className="lesson-placeholder">
          <p>
            This lesson is part of the curriculum.
            The interactive experience for this lesson
            type will be added next.
          </p>
        </div>
      )}

      <div className="lesson-footer">
        <button
          type="button"
          className="lesson-continue"
        >
          Continue
          <ArrowRight size={15} />
        </button>
      </div>
    </div>
  );
}

export default Lesson;