import { useEffect, useMemo, useState } from "react";
import { useParams } from "react-router-dom";

import BackButton from "../components/BackButton";
import ReviewCard from "../components/ReviewCard";
import PronunciationPopup from "../components/PronunciationPopup";
import CharacterPractice from "../components/CharacterPractice";

import curriculum from "../../data/processed/curriculum/mandarin/curriculum.json";

const TONE_INFO = {
  1: "High and level",
  2: "Rising",
  3: "Low and dipping",
  4: "Falling",
  5: "Neutral",
};

function speak(text, rate = 0.75) {
  if (!("speechSynthesis" in window)) return;

  window.speechSynthesis.cancel();

  const utterance =
    new SpeechSynthesisUtterance(text);

  utterance.lang = "zh-CN";
  utterance.rate = rate;
  utterance.pitch = 1;

  window.speechSynthesis.speak(utterance);
}

function Lesson() {
  const {
    languageId,
    lessonId,
  } = useParams();

  const [speakingId, setSpeakingId] =
    useState(null);

  const [
    pronunciationOpen,
    setPronunciationOpen,
  ] = useState(false);

  /*
    This component currently uses the
    Mandarin curriculum.

    Prevent Mandarin content from appearing
    on English, Japanese, or other language
    lesson routes.
  */

  const isMandarin =
    languageId?.toLowerCase() ===
    "mandarin";

  /*
    Lesson IDs:

    hsk1-unit-1-l1
    hsk1-unit-1-l2
    hsk1-unit-2-l1

    The lesson number is extracted dynamically.
  */

  const lesson = useMemo(() => {
    if (!isMandarin) {
      return null;
    }

    const match = lessonId?.match(
      /^hsk(\d+)-unit-(\d+)-l(\d+)$/i
    );

    if (!match) {
      return null;
    }

    const levelNumber = Number(match[1]);
    const unitNumber = Number(match[2]);
    const lessonNumber = Number(match[3]);

    if (
      levelNumber !== 1 ||
      unitNumber < 1 ||
      lessonNumber < 1
    ) {
      return null;
    }

    const unit = curriculum.units.find(
      (item) =>
        item.unitNumber === unitNumber
    );

    if (!unit) {
      return null;
    }

    const vocabulary =
      unit.vocabulary[lessonNumber - 1];

    if (!vocabulary) {
      return null;
    }

    return {
      unit,
      vocabulary,
      lessonNumber,
    };
  }, [
    isMandarin,
    lessonId,
  ]);

  /*
    Close speech when leaving the page.
  */

  useEffect(() => {
    return () => {
      if ("speechSynthesis" in window) {
        window.speechSynthesis.cancel();
      }
    };
  }, []);

  /*
    Close the pronunciation popup
    when navigating to another lesson.
  */

  useEffect(() => {
    setPronunciationOpen(false);
  }, [lessonId]);

  const playPronunciation = (
    text,
    id,
    rate = 0.75
  ) => {
    const speechId =
      `${id}-${rate}`;

    setSpeakingId(speechId);

    speak(text, rate);

    window.setTimeout(() => {
      setSpeakingId(null);
    }, 1800);
  };

  /*
    Prevent the Mandarin lesson component
    from displaying Mandarin content on
    another language route.
  */

  if (!isMandarin) {
    return (
      <div className="lesson-page">
        <BackButton />

        <div className="lesson-not-found">
          <h1>
            Language lesson unavailable
          </h1>

          <p>
            This lesson page is currently
            connected to the Mandarin curriculum.
            Mandarin content will not be shown
            for another language.
          </p>
        </div>
      </div>
    );
  }

  if (!lesson) {
    return (
      <div className="lesson-page">
        <BackButton />

        <div className="lesson-not-found">
          <h1>Lesson not found</h1>

          <p>
            This lesson could not be found in
            the Mandarin curriculum.
          </p>
        </div>
      </div>
    );
  }

  const {
    unit,
    vocabulary,
    lessonNumber,
  } = lesson;

  const tones =
    vocabulary.pronunciation?.tones || [];

  return (
    <div className="lesson-page">

      <BackButton />

      {/* --------------------------------------------------
          LESSON HEADER
          -------------------------------------------------- */}

      <header className="lesson-header">

        <p className="lesson-level">
          {curriculum.level}
        </p>

        <p className="lesson-unit">
          Unit {unit.unitNumber} ·{" "}
          {unit.title}
        </p>

        <h1>
          {vocabulary.word}
        </h1>

        <p className="lesson-description">
          Learn this word with pronunciation,
          meaning, tones and real examples.
        </p>

      </header>

      {/* --------------------------------------------------
          LESSON PROGRESS
          -------------------------------------------------- */}

      <div className="lesson-progress">

        <div>
          <span>
            Unit {unit.unitNumber}
          </span>

          <strong>
            Lesson {lessonNumber} of{" "}
            {unit.vocabulary.length}
          </strong>
        </div>

        <div className="lesson-progress-bar">

          <div
            style={{
              width: `${
                (lessonNumber /
                  unit.vocabulary.length) *
                100
              }%`,
            }}
          />

        </div>

      </div>

      {/* --------------------------------------------------
          VOCABULARY CARD
          -------------------------------------------------- */}

      <article className="vocabulary-card">

        <div className="vocabulary-main">

          {/* ------------------------------------------------
              WORD + PRONUNCIATION + TONES
              ------------------------------------------------ */}

          <div className="vocabulary-top">

            <div className="word-section">

              <h2 className="vocabulary-word">
                {vocabulary.word}
              </h2>

              <div className="pronunciation-row">

                <span className="vocabulary-pinyin">
                  {vocabulary.pronunciation?.pinyin ||
                    "Pronunciation unavailable"}
                </span>

                <button
                  type="button"
                  className="audio-button"
                  onClick={() =>
                    playPronunciation(
                      vocabulary.word,
                      vocabulary.id,
                      0.75
                    )
                  }
                >
                  {speakingId ===
                  `${vocabulary.id}-0.75`
                    ? "◼"
                    : "▶"}
                </button>

                <button
                  type="button"
                  className="slow-audio-button"
                  onClick={() =>
                    playPronunciation(
                      vocabulary.word,
                      vocabulary.id,
                      0.45
                    )
                  }
                >
                  Slow
                </button>

                <button
                  type="button"
                  className="pronunciation-help-button"
                  onClick={() =>
                    setPronunciationOpen(true)
                  }
                >
                  🐾 Learn pronunciation
                </button>

              </div>

            </div>

            {tones.length > 0 && (
              <div className="tone-box">

                <span className="tone-label">
                  TONES
                </span>

                <div className="tone-numbers">

                  {tones.map(
                    (tone, index) => (
                      <span
                        className={`tone tone-${tone}`}
                        key={`${vocabulary.id}-${index}`}
                      >
                        {tone}
                      </span>
                    )
                  )}

                </div>

                <div className="tone-description">

                  {tones
                    .map(
                      (tone) =>
                        TONE_INFO[tone]
                    )
                    .join(" · ")}

                </div>

              </div>
            )}

          </div>

          {/* ------------------------------------------------
              MEANING
              ------------------------------------------------ */}

          <div className="meaning-box">

            <span className="content-label">
              MEANING
            </span>

            <strong>
              {vocabulary.meaning}
            </strong>

          </div>

          {/* ------------------------------------------------
              PRONUNCIATION GUIDE
              ------------------------------------------------ */}

          <div className="pronunciation-guide">

            <div className="guide-header">

              <span className="content-label">
                PRONUNCIATION GUIDE
              </span>

              <span className="guide-note">
                Listen first, then repeat
              </span>

            </div>

            <div className="guide-content">

              <div className="guide-pinyin">
                {
                  vocabulary.pronunciation
                    ?.pinyin
                }
              </div>

              <div className="guide-tones">

                {tones.map(
                  (tone, index) => (
                    <div
                      className="guide-tone"
                      key={`${vocabulary.id}-guide-${index}`}
                    >

                      <span>
                        Syllable{" "}
                        {index + 1}
                      </span>

                      <strong>
                        Tone {tone}
                      </strong>

                      <small>
                        {TONE_INFO[tone]}
                      </small>

                    </div>
                  )
                )}

              </div>

            </div>

          </div>

          {/* ------------------------------------------------
              CHARACTER / STROKE PRACTICE
              ------------------------------------------------ */}

          <CharacterPractice
            character={vocabulary.word}
            pinyin={
              vocabulary.pronunciation?.pinyin
            }
            tone={
              vocabulary.pronunciation?.tones?.[0]
            }
          />

          {/* ------------------------------------------------
              REAL EXAMPLES
              ------------------------------------------------ */}

          {vocabulary.examples?.length > 0 && (
            <div className="vocabulary-examples">

              <div className="examples-header">

                <div>

                  <span className="content-label">
                    REAL EXAMPLES
                  </span>

                  <p>
                    Examples from Tatoeba
                  </p>

                </div>

              </div>

              <div className="example-list">

                {vocabulary.examples.map(
                  (example) => (
                    <div
                      className="example-item"
                      key={example.id}
                    >

                      <div className="example-text-row">

                        <div>

                          <p className="example-chinese">
                            {example.text}
                          </p>

                          {example.translation && (
                            <p className="example-translation">
                              {
                                example.translation
                              }
                            </p>
                          )}

                        </div>

                        <button
                          type="button"
                          className="example-audio"
                          onClick={() =>
                            playPronunciation(
                              example.text,
                              `${vocabulary.id}-${example.id}`,
                              0.7
                            )
                          }
                        >
                          🔊
                        </button>

                      </div>

                    </div>
                  )
                )}

              </div>

            </div>
          )}

        </div>

      </article>

      {/* --------------------------------------------------
          SPACED REPETITION
          -------------------------------------------------- */}

      <ReviewCard
        vocabulary={vocabulary}
      />

      {/* --------------------------------------------------
          PRONUNCIATION POPUP
          -------------------------------------------------- */}

      {pronunciationOpen && (
        <PronunciationPopup
          vocabulary={vocabulary}
          languageId={languageId}
          onClose={() =>
            setPronunciationOpen(false)
          }
          onSpeak={playPronunciation}
        />
      )}

    </div>
  );
}

export default Lesson;