import { useEffect, useMemo, useState } from "react";
import { useParams } from "react-router-dom";

import BackButton from "../components/BackButton";
import ReviewCard from "../components/ReviewCard";
import PronunciationPopup from "../components/PronunciationPopup";
import CharacterPractice from "../components/CharacterPractice";

import mandarinCurriculumData from "../../data/processed/curriculum/mandarin/curriculum.json";

import { englishCurriculum } from "../data/content/english/curriculum";
import { japaneseCurriculum } from "../data/content/japanese/curriculum";

import { englishA1Vocabulary } from "../data/content/english/vocabulary/a1";
import { japaneseN5Vocabulary } from "../data/content/japanese/vocabulary/n5";

const TONE_INFO = {
  1: "High and level",
  2: "Rising",
  3: "Low and dipping",
  4: "Falling",
  5: "Neutral",
};

function speak(text, languageId, rate = 0.75) {
  if (!("speechSynthesis" in window)) return;

  window.speechSynthesis.cancel();

  const utterance =
    new SpeechSynthesisUtterance(text);

  if (languageId === "mandarin") {
    utterance.lang = "zh-CN";
  } else if (languageId === "japanese") {
    utterance.lang = "ja-JP";
  } else {
    utterance.lang = "en-US";
  }

  utterance.rate = rate;
  utterance.pitch = 1;

  window.speechSynthesis.speak(utterance);
}

function getVocabularyForLesson(
  languageId,
  lesson
) {
  if (!lesson) return null;

  if (languageId === "mandarin") {
    return null;
  }

  const vocabulary =
    languageId === "english"
      ? englishA1Vocabulary
      : japaneseN5Vocabulary;

  if (!vocabulary?.length) {
    return null;
  }

  /*
    Demo content currently uses topic/contentId
    names such as:

    greetings
    introductions
    daily-activities
  */

  const topicMatch = vocabulary.find(
    (entry) =>
      entry.topics?.includes(
        lesson.contentId
      )
  );

  if (topicMatch) {
    return topicMatch;
  }

  /*
    Safe fallback for the current demo
    English/Japanese lessons.

    This does NOT affect Mandarin.
  */

  return vocabulary[0] || null;
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

  const normalizedLanguage =
    languageId?.toLowerCase();

  /*
    =========================================================
    LANGUAGE-SPECIFIC CURRICULUM
    =========================================================

    Mandarin:
      Generated curriculum JSON.

    English:
      English A1 curriculum.

    Japanese:
      Japanese N5 curriculum.

    Each language remains isolated.
  */

  const languageCurriculum = useMemo(() => {
    if (normalizedLanguage === "mandarin") {
      return mandarinCurriculumData;
    }

    if (normalizedLanguage === "english") {
      return englishCurriculum;
    }

    if (normalizedLanguage === "japanese") {
      return japaneseCurriculum;
    }

    return null;
  }, [normalizedLanguage]);

  /*
    =========================================================
    FIND LESSON
    =========================================================
  */

  const lesson = useMemo(() => {
    if (!languageCurriculum || !lessonId) {
      return null;
    }

    /*
      -------------------------------------------------------
      MANDARIN
      -------------------------------------------------------

      Example IDs:

      hsk1-unit-1-l1
      hsk1-unit-1-l2
      hsk1-unit-2-l1
    */

    if (normalizedLanguage === "mandarin") {
      const match = lessonId.match(
        /^hsk(\d+)-unit-(\d+)-l(\d+)$/i
      );

      if (!match) {
        return null;
      }

      const levelNumber = Number(
        match[1]
      );

      const unitNumber = Number(
        match[2]
      );

      const lessonNumber = Number(
        match[3]
      );

      if (
        levelNumber !== 1 ||
        unitNumber < 1 ||
        lessonNumber < 1
      ) {
        return null;
      }

      const unit =
        languageCurriculum.units.find(
          (item) =>
            item.unitNumber ===
            unitNumber
        );

      if (!unit) {
        return null;
      }

      const vocabulary =
        unit.vocabulary[
          lessonNumber - 1
        ];

      if (!vocabulary) {
        return null;
      }

      return {
        language: "mandarin",

        unit,

        lesson: {
          id: lessonId,
          title: vocabulary.word,
          type: "vocabulary",
        },

        vocabulary,

        lessonNumber,
      };
    }

    /*
      -------------------------------------------------------
      ENGLISH / JAPANESE
      -------------------------------------------------------
    */

    const unit =
      languageCurriculum.units.find(
        (item) =>
          item.lessons?.some(
            (lessonItem) =>
              lessonItem.id ===
              lessonId
          )
      );

    if (!unit) {
      return null;
    }

    const lessonData =
      unit.lessons.find(
        (item) =>
          item.id === lessonId
      );

    if (!lessonData) {
      return null;
    }

    const vocabulary =
      getVocabularyForLesson(
        normalizedLanguage,
        lessonData
      );

    return {
      language:
        normalizedLanguage,

      unit,

      lesson: lessonData,

      vocabulary,

      lessonNumber:
        unit.lessons.findIndex(
          (item) =>
            item.id === lessonId
        ) + 1,
    };
  }, [
    languageCurriculum,
    lessonId,
    normalizedLanguage,
  ]);

  /*
    =========================================================
    CLEAN UP SPEECH
    =========================================================
  */

  useEffect(() => {
    return () => {
      if ("speechSynthesis" in window) {
        window.speechSynthesis.cancel();
      }
    };
  }, []);

  /*
    Close pronunciation popup when
    changing lesson/language.
  */

  useEffect(() => {
    setPronunciationOpen(false);
  }, [
    lessonId,
    languageId,
  ]);

  /*
    =========================================================
    SPEECH HANDLER
    =========================================================
  */

  const playPronunciation = (
    text,
    id,
    rate = 0.75
  ) => {
    const speechId =
      `${id}-${rate}`;

    setSpeakingId(
      speechId
    );

    speak(
      text,
      normalizedLanguage,
      rate
    );

    window.setTimeout(() => {
      setSpeakingId(null);
    }, 1800);
  };

  /*
    =========================================================
    UNKNOWN LANGUAGE
    =========================================================
  */

  if (!languageCurriculum) {
    return (
      <div className="lesson-page">
        <BackButton />

        <div className="lesson-not-found">
          <h1>
            Language not found
          </h1>

          <p>
            VerbaLynx does not have a
            lesson curriculum for this
            language yet.
          </p>
        </div>
      </div>
    );
  }

  /*
    =========================================================
    LESSON NOT FOUND
    =========================================================
  */

  if (!lesson) {
    return (
      <div className="lesson-page">
        <BackButton />

        <div className="lesson-not-found">
          <h1>
            Lesson not found
          </h1>

          <p>
            This lesson does not exist
            in the{" "}
            {normalizedLanguage}{" "}
            curriculum.
          </p>
        </div>
      </div>
    );
  }

  const {
    unit,
    lesson: lessonData,
    vocabulary,
    lessonNumber,
  } = lesson;

  /*
    =========================================================
    MANDARIN TONES
    =========================================================
  */

  const tones =
    normalizedLanguage === "mandarin"
      ? vocabulary?.pronunciation
          ?.tones || []
      : [];

  /*
    =========================================================
    LANGUAGE DISPLAY
    =========================================================
  */

  const languageNames = {
    english: "English",
    mandarin: "Mandarin",
    japanese: "Japanese",
  };

  const languageName =
    languageNames[
      normalizedLanguage
    ] ||
    normalizedLanguage;

  /*
    =========================================================
    ENGLISH PRONUNCIATION DATA
    =========================================================

    The generated English data contains:

      pronunciation.ipa
      pronunciation.syllables
      pronunciation.ipaSyllables
      pronunciation.cmu

    Example:

      hello

      syllables:
        ["hel", "lo"]

      ipaSyllables:
        ["hə", "ˈloʊ"]
  */

  const englishPronunciation =
    normalizedLanguage === "english"
      ? vocabulary?.pronunciation
      : null;

  /*
    =========================================================
    JAPANESE PRONUNCIATION DATA
    =========================================================
  */

  const japanesePronunciation =
    normalizedLanguage === "japanese"
      ? vocabulary?.pronunciation
      : null;

  /*
    =========================================================
    MANDARIN LESSON
    =========================================================
  */

  if (
    normalizedLanguage === "mandarin" &&
    vocabulary
  ) {
    return (
      <div className="lesson-page">

        <BackButton />

        <header className="lesson-header">

          <p className="lesson-level">
            {languageCurriculum.level}
          </p>

          <p className="lesson-unit">
            Unit{" "}
            {unit.unitNumber} ·{" "}
            {unit.title}
          </p>

          <h1>
            {vocabulary.word}
          </h1>

          <p className="lesson-description">
            Learn this word with
            pronunciation, meaning,
            tones and real examples.
          </p>

        </header>

        <div className="lesson-progress">

          <div>

            <span>
              Unit{" "}
              {unit.unitNumber}
            </span>

            <strong>
              Lesson{" "}
              {lessonNumber} of{" "}
              {unit.vocabulary.length}
            </strong>

          </div>

          <div className="lesson-progress-bar">

            <div
              style={{
                width: `${
                  (
                    lessonNumber /
                    unit.vocabulary.length
                  ) *
                  100
                }%`,
              }}
            />

          </div>

        </div>

        <article className="vocabulary-card">

          <div className="vocabulary-main">

            <div className="vocabulary-top">

              <div className="word-section">

                <h2 className="vocabulary-word">
                  {vocabulary.word}
                </h2>

                <div className="pronunciation-row">

                  <span className="vocabulary-pinyin">
                    {
                      vocabulary
                        .pronunciation
                        ?.pinyin ||
                      "Pronunciation unavailable"
                    }
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
                      setPronunciationOpen(
                        true
                      )
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
                          TONE_INFO[
                            tone
                          ]
                      )
                      .join(" · ")}

                  </div>

                </div>
              )}

            </div>

            <div className="meaning-box">

              <span className="content-label">
                MEANING
              </span>

              <strong>
                {vocabulary.meaning}
              </strong>

            </div>

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
                    vocabulary
                      .pronunciation
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
                          Tone{" "}
                          {tone}
                        </strong>

                        <small>
                          {
                            TONE_INFO[
                              tone
                            ]
                          }
                        </small>

                      </div>
                    )
                  )}

                </div>

              </div>

            </div>

            <CharacterPractice
              character={
                vocabulary.word
              }
              pinyin={
                vocabulary
                  .pronunciation
                  ?.pinyin
              }
              tone={
                vocabulary
                  .pronunciation
                  ?.tones?.[0]
              }
            />

            {vocabulary.examples
              ?.length > 0 && (
              <div className="vocabulary-examples">

                <div className="examples-header">

                  <div>

                    <span className="content-label">
                      REAL EXAMPLES
                    </span>

                    <p>
                      Examples from
                      Tatoeba
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
                              {
                                example.text
                              }
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

        <ReviewCard
          vocabulary={vocabulary}
        />

        {pronunciationOpen && (
          <PronunciationPopup
            vocabulary={vocabulary}
            languageId={
              languageId
            }
            onClose={() =>
              setPronunciationOpen(
                false
              )
            }
            onSpeak={
              playPronunciation
            }
          />
        )}

      </div>
    );
  }

  /*
    =========================================================
    ENGLISH / JAPANESE LESSON
    =========================================================
  */

  return (
    <div className="lesson-page">

      <BackButton />

      <header className="lesson-header">

        <p className="lesson-level">
          {languageCurriculum.level}
        </p>

        <p className="lesson-unit">
          Unit{" "}
          {unit.id}
        </p>

        <h1>
          {lessonData.title}
        </h1>

        <p className="lesson-description">
          {unit.description}
        </p>

      </header>

      <div className="lesson-progress">

        <div>

          <span>
            {languageName}
          </span>

          <strong>
            Lesson{" "}
            {lessonNumber} of{" "}
            {unit.lessons.length}
          </strong>

        </div>

        <div className="lesson-progress-bar">

          <div
            style={{
              width: `${
                (
                  lessonNumber /
                  unit.lessons.length
                ) *
                100
              }%`,
            }}
          />

        </div>

      </div>

      <article className="vocabulary-card">

        <div className="vocabulary-main">

          <div className="vocabulary-top">

            <div className="word-section">

              <span className="content-label">
                {lessonData.type}
              </span>

              <h2 className="vocabulary-word">
                {vocabulary?.word ||
                  lessonData.title}
              </h2>

              {vocabulary && (
                <div className="pronunciation-row">

                  <span className="vocabulary-pinyin">

                    {normalizedLanguage ===
                    "japanese"
                      ? japanesePronunciation
                          ?.romanization
                      : englishPronunciation
                          ?.ipa}

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
                      setPronunciationOpen(
                        true
                      )
                    }
                  >
                    🐾 Learn pronunciation
                  </button>

                </div>
              )}

            </div>

          </div>

          {vocabulary && (
            <>

              <div className="meaning-box">

                <span className="content-label">
                  MEANING
                </span>

                <strong>
                  {vocabulary.meaning}
                </strong>

              </div>

              <div className="pronunciation-guide">

                <div className="guide-header">

                  <span className="content-label">
                    PRONUNCIATION
                  </span>

                  <span className="guide-note">
                    Listen first, then repeat
                  </span>

                </div>

                <div className="guide-content">

                  {normalizedLanguage ===
                    "english" && (
                    <>

                      <div className="guide-pinyin">
                        {
                          englishPronunciation
                            ?.ipa
                        }
                      </div>

                      {englishPronunciation
                        ?.syllables
                        ?.length > 0 && (
                        <div className="guide-tones">

                          {englishPronunciation
                            .syllables
                            .map(
                              (
                                syllable,
                                index
                              ) => (
                                <div
                                  className="guide-tone"
                                  key={`${vocabulary.id}-english-${index}`}
                                >

                                  <span>
                                    Part{" "}
                                    {index +
                                      1}
                                  </span>

                                  <strong>
                                    {
                                      syllable
                                    }
                                  </strong>

                                  <small>
                                    {
                                      englishPronunciation
                                        ?.ipaSyllables?.[
                                        index
                                      ]
                                    }
                                  </small>

                                </div>
                              )
                            )}

                        </div>
                      )}

                    </>
                  )}

                  {normalizedLanguage ===
                    "japanese" && (
                    <>

                      <div className="guide-pinyin">
                        {
                          japanesePronunciation
                            ?.kana
                        }
                      </div>

                      <div className="guide-pinyin">
                        {
                          japanesePronunciation
                            ?.ipa
                        }
                      </div>

                    </>
                  )}

                </div>

              </div>

              {vocabulary.examples
                ?.length > 0 && (
                <div className="vocabulary-examples">

                  <div className="examples-header">

                    <div>

                      <span className="content-label">
                        EXAMPLES
                      </span>

                    </div>

                  </div>

                  <div className="example-list">

                    {vocabulary.examples.map(
                      (
                        example,
                        index
                      ) => (
                        <div
                          className="example-item"
                          key={
                            example.id ||
                            index
                          }
                        >

                          <div className="example-text-row">

                            <div>

                              <p className="example-chinese">
                                {
                                  example.text
                                }
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
                                  `${lessonId}-${index}`,
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

            </>
          )}

          {!vocabulary && (
            <div className="meaning-box">

              <span className="content-label">
                LESSON
              </span>

              <strong>
                This lesson is part of the{" "}
                {languageName}{" "}
                curriculum.
              </strong>

              <p>
                Language-specific lesson
                content will be connected
                here without using
                content from another
                language.
              </p>

            </div>
          )}

        </div>

      </article>

      {vocabulary && (
        <ReviewCard
          vocabulary={vocabulary}
        />
      )}

      {vocabulary &&
        pronunciationOpen && (
        <PronunciationPopup
          vocabulary={vocabulary}
          languageId={
            languageId
          }
          onClose={() =>
            setPronunciationOpen(
              false
            )
          }
          onSpeak={
            playPronunciation
          }
        />
      )}

    </div>
  );
}

export default Lesson;