import { useEffect, useMemo, useState } from "react";
import "./PronunciationPopup.css";

const TONE_INFO = {
  1: "High and level",
  2: "Rising",
  3: "Low and dipping",
  4: "Falling",
  5: "Neutral",
};

const TONE_CURVE = {
  1: "→",
  2: "↗",
  3: "↘↗",
  4: "↘",
  5: "·",
};

function splitMandarinPinyin(pinyin = "") {
  return pinyin
    .trim()
    .split(/\s+/)
    .filter(Boolean);
}

function getEnglishSyllables(pronunciation) {
  if (!pronunciation) {
    return [];
  }

  const syllables =
    pronunciation.syllables || [];

  const ipaSyllables =
    pronunciation.ipaSyllables || [];

  return syllables.map(
    (syllable, index) => ({
      text: syllable,
      ipa: ipaSyllables[index] || "",
    })
  );
}

function PronunciationPopup({
  vocabulary,
  languageId,
  onClose,
  onSpeak,
}) {
  const [activeSyllable, setActiveSyllable] =
    useState(0);

  const normalizedLanguage =
    languageId?.toLowerCase();

  const isMandarin =
    normalizedLanguage === "mandarin";

  const isEnglish =
    normalizedLanguage === "english";

  const isJapanese =
    normalizedLanguage === "japanese";

  /*
    ---------------------------------------------------------
    MANDARIN DATA
    ---------------------------------------------------------
  */

  const pinyin =
    vocabulary?.pronunciation?.pinyin ||
    "";

  const tones =
    vocabulary?.pronunciation?.tones ||
    [];

  const mandarinSyllables = useMemo(
    () =>
      splitMandarinPinyin(
        pinyin
      ),
    [pinyin]
  );

  const toneDataMatches =
    mandarinSyllables.length ===
    tones.length;

  /*
    ---------------------------------------------------------
    ENGLISH DATA
    ---------------------------------------------------------
  */

  const englishPronunciation =
    isEnglish
      ? vocabulary?.pronunciation
      : null;

  const englishSyllables = useMemo(
    () =>
      getEnglishSyllables(
        englishPronunciation
      ),
    [englishPronunciation]
  );

  /*
    ---------------------------------------------------------
    JAPANESE DATA
    ---------------------------------------------------------
  */

  const japanesePronunciation =
    isJapanese
      ? vocabulary?.pronunciation
      : null;

  /*
    ---------------------------------------------------------
    RESET ACTIVE SYLLABLE
    ---------------------------------------------------------
  */

  useEffect(() => {
    setActiveSyllable(0);
  }, [vocabulary?.id]);

  /*
    ---------------------------------------------------------
    ESCAPE KEY
    ---------------------------------------------------------
  */

  useEffect(() => {
    const handleKeyDown = (
      event
    ) => {
      if (event.key === "Escape") {
        onClose();
      }
    };

    window.addEventListener(
      "keydown",
      handleKeyDown
    );

    return () => {
      window.removeEventListener(
        "keydown",
        handleKeyDown
      );
    };
  }, [onClose]);

  /*
    ---------------------------------------------------------
    MANDARIN AUTO SYLLABLE ANIMATION
    ---------------------------------------------------------
  */

  useEffect(() => {
    if (
      !isMandarin ||
      !toneDataMatches ||
      mandarinSyllables.length <= 1
    ) {
      return undefined;
    }

    const timer =
      window.setInterval(() => {
        setActiveSyllable(
          (current) =>
            current >=
            mandarinSyllables.length - 1
              ? 0
              : current + 1
        );
      }, 1600);

    return () => {
      window.clearInterval(
        timer
      );
    };
  }, [
    isMandarin,
    toneDataMatches,
    mandarinSyllables.length,
  ]);

  /*
    ---------------------------------------------------------
    ENGLISH AUTO SYLLABLE ANIMATION
    ---------------------------------------------------------
  */

  useEffect(() => {
    if (
      !isEnglish ||
      englishSyllables.length <= 1
    ) {
      return undefined;
    }

    const timer =
      window.setInterval(() => {
        setActiveSyllable(
          (current) =>
            current >=
            englishSyllables.length - 1
              ? 0
              : current + 1
        );
      }, 1500);

    return () => {
      window.clearInterval(
        timer
      );
    };
  }, [
    isEnglish,
    englishSyllables.length,
  ]);

  /*
    ---------------------------------------------------------
    PLAY INDIVIDUAL MANDARIN SYLLABLE
    ---------------------------------------------------------
  */

  const playMandarinSyllable = (
    index
  ) => {
    const characters = [
      ...(
        vocabulary?.word || ""
      ),
    ].filter((character) =>
      /[\u3400-\u9fff]/.test(
        character
      )
    );

    const character =
      characters[index] ||
      vocabulary?.word;

    setActiveSyllable(index);

    onSpeak(
      character,
      `${vocabulary.id}-syllable-${index}`,
      0.55
    );
  };

  /*
    ---------------------------------------------------------
    PLAY ENGLISH WORD
    ---------------------------------------------------------
  */

  const playEnglishWord = (
    rate = 0.65
  ) => {
    setActiveSyllable(0);

    onSpeak(
      vocabulary.word,
      `${vocabulary.id}-popup-${rate}`,
      rate
    );
  };

  /*
    ---------------------------------------------------------
    PLAY JAPANESE WORD
    ---------------------------------------------------------
  */

  const playJapaneseWord = (
    rate = 0.65
  ) => {
    setActiveSyllable(0);

    onSpeak(
      vocabulary.word,
      `${vocabulary.id}-popup-${rate}`,
      rate
    );
  };

  /*
    ---------------------------------------------------------
    UNKNOWN / FALLBACK LANGUAGE
    ---------------------------------------------------------
  */

  if (
    !isMandarin &&
    !isEnglish &&
    !isJapanese
  ) {
    return (
      <div
        className="pronunciation-modal"
        onMouseDown={(event) => {
          if (
            event.target ===
            event.currentTarget
          ) {
            onClose();
          }
        }}
      >
        <div className="pronunciation-popup">

          <button
            type="button"
            className="pronunciation-popup-close"
            onClick={onClose}
            aria-label="Close"
          >
            ×
          </button>

          <div className="pronunciation-coming-soon">

            <div className="pronunciation-lynx">
              🐾
            </div>

            <span className="content-label">
              PRONUNCIATION COACH
            </span>

            <h2>
              Pronunciation
            </h2>

            <p>
              Pronunciation support for
              this language is not
              connected yet.
            </p>

          </div>

        </div>
      </div>
    );
  }

  /*
    =========================================================
    MANDARIN POPUP
    =========================================================
  */

  if (isMandarin) {
    return (
      <div
        className="pronunciation-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="pronunciation-title"
        onMouseDown={(event) => {
          if (
            event.target ===
            event.currentTarget
          ) {
            onClose();
          }
        }}
      >

        <div className="pronunciation-popup">

          <button
            type="button"
            className="pronunciation-popup-close"
            onClick={onClose}
            aria-label="Close pronunciation coach"
          >
            ×
          </button>

          <div className="pronunciation-hero">

            <div
              className={`pronunciation-lynx tone-${
                tones[
                  activeSyllable
                ] || 0
              }`}
            >

              <span className="lynx-tail">
                〰
              </span>

              <span className="lynx-character">
                🐈
              </span>

              <span className="lynx-paw">
                🐾
              </span>

            </div>

            <div className="lynx-speech">
              <span>🐾</span>

              <strong>
                Let&apos;s break it down!
              </strong>
            </div>

          </div>

          <div className="pronunciation-heading">

            <span className="content-label">
              PRONUNCIATION COACH
            </span>

            <h2 id="pronunciation-title">
              {vocabulary.word}
            </h2>

            <p className="popup-pinyin">
              {pinyin}
            </p>

            <span className="popup-meaning">
              {vocabulary.meaning}
            </span>

          </div>

          <div className="pronunciation-syllables">

            {mandarinSyllables.map(
              (
                syllable,
                index
              ) => {
                const tone =
                  tones[index];

                return (
                  <button
                    type="button"
                    key={`${vocabulary.id}-${index}`}
                    className={`pronunciation-syllable ${
                      index ===
                      activeSyllable
                        ? "is-active"
                        : ""
                    }`}
                    onClick={() =>
                      playMandarinSyllable(
                        index
                      )
                    }
                  >

                    <span className="syllable-number">
                      {String(
                        index + 1
                      ).padStart(
                        2,
                        "0"
                      )}
                    </span>

                    <strong>
                      {syllable}
                    </strong>

                    {tone ? (
                      <>
                        <span
                          className={`syllable-tone tone-${tone}`}
                        >
                          TONE {tone}
                        </span>

                        <span className="tone-curve">
                          {
                            TONE_CURVE[
                              tone
                            ]
                          }
                        </span>

                        <small>
                          {
                            TONE_INFO[
                              tone
                            ]
                          }
                        </small>
                      </>
                    ) : (
                      <small>
                        Tone data unavailable
                      </small>
                    )}

                    <span className="syllable-audio">
                      🔊
                    </span>

                  </button>
                );
              }
            )}

          </div>

          {!toneDataMatches &&
            mandarinSyllables.length >
              0 && (
              <p className="pronunciation-note">
                The curriculum does not
                provide one tone value
                for every displayed
                syllable, so VerbaLynx
                will not guess the
                missing information.
              </p>
            )}

          <div className="pronunciation-actions">

            <button
              type="button"
              className="pronunciation-main-button"
              onClick={() =>
                onSpeak(
                  vocabulary.word,
                  `${vocabulary.id}-popup-0.65`,
                  0.65
                )
              }
            >
              <span>▶</span>
              Listen
            </button>

            <button
              type="button"
              className="pronunciation-slow-button"
              onClick={() =>
                onSpeak(
                  vocabulary.word,
                  `${vocabulary.id}-popup-0.4`,
                  0.4
                )
              }
            >
              Slow
            </button>

          </div>

          <div className="pronunciation-footer">

            <span>
              Listen → repeat → master
            </span>

            <span>
              🐾
            </span>

          </div>

        </div>

      </div>
    );
  }

  /*
    =========================================================
    ENGLISH POPUP
    =========================================================
  */

  if (isEnglish) {
    return (
      <div
        className="pronunciation-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="pronunciation-title"
        onMouseDown={(event) => {
          if (
            event.target ===
            event.currentTarget
          ) {
            onClose();
          }
        }}
      >

        <div className="pronunciation-popup">

          <button
            type="button"
            className="pronunciation-popup-close"
            onClick={onClose}
            aria-label="Close pronunciation coach"
          >
            ×
          </button>

          <div className="pronunciation-hero">

            <div className="pronunciation-lynx">

              <span className="lynx-tail">
                〰
              </span>

              <span className="lynx-character">
                🐈
              </span>

              <span className="lynx-paw">
                🐾
              </span>

            </div>

            <div className="lynx-speech">
              <span>🐾</span>

              <strong>
                Let&apos;s say it clearly!
              </strong>
            </div>

          </div>

          <div className="pronunciation-heading">

            <span className="content-label">
              ENGLISH PRONUNCIATION COACH
            </span>

            <h2 id="pronunciation-title">
              {vocabulary.word}
            </h2>

            <p className="popup-pinyin">
              {englishPronunciation?.ipa ||
                "IPA unavailable"}
            </p>

            <span className="popup-meaning">
              {vocabulary.meaning}
            </span>

          </div>

          <div className="pronunciation-syllables">

            {englishSyllables.length >
            0 ? (
              englishSyllables.map(
                (
                  syllable,
                  index
                ) => (
                  <button
                    type="button"
                    key={`${vocabulary.id}-english-${index}`}
                    className={`pronunciation-syllable ${
                      index ===
                      activeSyllable
                        ? "is-active"
                        : ""
                    }`}
                    onClick={() => {
                      setActiveSyllable(
                        index
                      );

                      onSpeak(
                        vocabulary.word,
                        `${vocabulary.id}-english-${index}`,
                        0.5
                      );
                    }}
                  >

                    <span className="syllable-number">
                      {String(
                        index + 1
                      ).padStart(
                        2,
                        "0"
                      )}
                    </span>

                    <strong>
                      {syllable.text}
                    </strong>

                    <span className="syllable-tone">
                      IPA
                    </span>

                    <span className="tone-curve">
                      {syllable.ipa ||
                        "—"}
                    </span>

                    <small>
                      Pronunciation part{" "}
                      {index + 1}
                    </small>

                    <span className="syllable-audio">
                      🔊
                    </span>

                  </button>
                )
              )
            ) : (
              <div className="pronunciation-note">
                English syllable data is
                unavailable for this word.
              </div>
            )}

          </div>

          <div className="pronunciation-guide">

            <div className="guide-header">

              <span className="content-label">
                PHONETIC BREAKDOWN
              </span>

              <span className="guide-note">
                IPA from CMU Pronouncing
                Dictionary data
              </span>

            </div>

            <div className="guide-content">

              <div className="guide-pinyin">
                {englishPronunciation?.ipa ||
                  "IPA unavailable"}
              </div>

              {englishPronunciation
                ?.cmu && (
                <div className="guide-tones">

                  <div className="guide-tone">

                    <span>
                      CMU
                    </span>

                    <strong>
                      {
                        englishPronunciation
                          .cmu
                      }
                    </strong>

                    <small>
                      Pronunciation
                      dictionary notation
                    </small>

                  </div>

                </div>
              )}

            </div>

          </div>

          <div className="pronunciation-actions">

            <button
              type="button"
              className="pronunciation-main-button"
              onClick={() =>
                playEnglishWord(
                  0.65
                )
              }
            >
              <span>▶</span>
              Listen
            </button>

            <button
              type="button"
              className="pronunciation-slow-button"
              onClick={() =>
                playEnglishWord(
                  0.4
                )
              }
            >
              Slow
            </button>

          </div>

          <div className="pronunciation-footer">

            <span>
              Listen → repeat → master
            </span>

            <span>
              🐾
            </span>

          </div>

        </div>

      </div>
    );
  }

  /*
    =========================================================
    JAPANESE POPUP
    =========================================================
  */

  return (
    <div
      className="pronunciation-modal"
      role="dialog"
      aria-modal="true"
      aria-labelledby="pronunciation-title"
      onMouseDown={(event) => {
        if (
          event.target ===
          event.currentTarget
        ) {
          onClose();
        }
      }}
    >

      <div className="pronunciation-popup">

        <button
          type="button"
          className="pronunciation-popup-close"
          onClick={onClose}
          aria-label="Close pronunciation coach"
        >
          ×
        </button>

        <div className="pronunciation-hero">

          <div className="pronunciation-lynx">

            <span className="lynx-tail">
              〰
            </span>

            <span className="lynx-character">
              🐈
            </span>

            <span className="lynx-paw">
              🐾
            </span>

          </div>

          <div className="lynx-speech">

            <span>🐾</span>

            <strong>
              Let&apos;s break it down!
            </strong>

          </div>

        </div>

        <div className="pronunciation-heading">

          <span className="content-label">
            JAPANESE PRONUNCIATION COACH
          </span>

          <h2 id="pronunciation-title">
            {vocabulary.word}
          </h2>

          <p className="popup-pinyin">
            {
              japanesePronunciation
                ?.romanization
            }
          </p>

          <span className="popup-meaning">
            {vocabulary.meaning}
          </span>

        </div>

        <div className="pronunciation-syllables">

          <div
            className="pronunciation-syllable is-active"
          >

            <span className="syllable-number">
              01
            </span>

            <strong>
              {
                japanesePronunciation
                  ?.kana ||
                vocabulary.word
              }
            </strong>

            <span className="syllable-tone">
              ROMANIZATION
            </span>

            <span className="tone-curve">
              {
                japanesePronunciation
                  ?.romanization ||
                "—"
              }
            </span>

            <small>
              Japanese pronunciation
            </small>

            <span className="syllable-audio">
              🔊
            </span>

          </div>

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

            <div className="guide-pinyin">
              {
                japanesePronunciation
                  ?.kana
              }
            </div>

            <div className="guide-tones">

              <div className="guide-tone">

                <span>
                  IPA
                </span>

                <strong>
                  {
                    japanesePronunciation
                      ?.ipa ||
                    "Unavailable"
                  }
                </strong>

                <small>
                  Japanese phonetic
                  transcription
                </small>

              </div>

            </div>

          </div>

        </div>

        <div className="pronunciation-actions">

          <button
            type="button"
            className="pronunciation-main-button"
            onClick={() =>
              playJapaneseWord(
                0.65
              )
            }
          >
            <span>▶</span>
            Listen
          </button>

          <button
            type="button"
            className="pronunciation-slow-button"
            onClick={() =>
              playJapaneseWord(
                0.4
              )
            }
          >
            Slow
          </button>

        </div>

        <div className="pronunciation-footer">

          <span>
            Listen → repeat → master
          </span>

          <span>
            🐾
          </span>

        </div>

      </div>

    </div>
  );
}

export default PronunciationPopup;