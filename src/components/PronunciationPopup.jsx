import { useEffect, useState } from "react";
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

function getSyllables(vocabulary) {
  const generatedSyllables =
    vocabulary.pronunciation?.syllables;

  if (
    Array.isArray(generatedSyllables) &&
    generatedSyllables.length > 0
  ) {
    return generatedSyllables;
  }

  const pinyin =
    vocabulary.pronunciation?.pinyin || "";

  return pinyin
    .trim()
    .split(/\s+/)
    .filter(Boolean);
}

function PronunciationPopup({
  vocabulary,
  languageId,
  onClose,
  onSpeak,
}) {
  const [activeSyllable, setActiveSyllable] =
    useState(0);

  const isMandarin =
    languageId?.toLowerCase() ===
    "mandarin";

  const pinyin =
    vocabulary.pronunciation?.pinyin || "";

  const tones =
    vocabulary.pronunciation?.tones || [];

  const syllables =
    getSyllables(vocabulary);

  const toneDataMatches =
    syllables.length === tones.length;

  /*
    Reset the active syllable whenever
    another vocabulary item is opened.
  */
  useEffect(() => {
    setActiveSyllable(0);
  }, [vocabulary.id]);

  /*
    Allow Escape to close the popup.
  */
  useEffect(() => {
    const handleKeyDown = (event) => {
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
    Automatically move through the syllables
    when the Mandarin popup is open.

    The animation only runs when we have
    matching syllable and tone data.
  */
  useEffect(() => {
    if (
      !isMandarin ||
      !toneDataMatches ||
      syllables.length <= 1
    ) {
      return undefined;
    }

    const timer = window.setInterval(() => {
      setActiveSyllable((current) =>
        current >= syllables.length - 1
          ? 0
          : current + 1
      );
    }, 1600);

    return () => {
      window.clearInterval(timer);
    };
  }, [
    isMandarin,
    toneDataMatches,
    syllables.length,
  ]);

  /*
    Play an individual Mandarin syllable.

    We use the corresponding Chinese character
    when possible instead of trying to make the
    browser pronounce the pinyin itself.
  */
  const playSyllable = (index) => {
    const characters = [
      ...vocabulary.word,
    ].filter((character) =>
      /[\u3400-\u9fff]/.test(character)
    );

    const character =
      characters[index] ||
      vocabulary.word;

    setActiveSyllable(index);

    onSpeak(
      character,
      `${vocabulary.id}-syllable-${index}`,
      0.55
    );
  };

  /*
    Play the complete word.
  */
  const playWord = (rate = 0.65) => {
    onSpeak(
      vocabulary.word,
      `${vocabulary.id}-popup-${rate}`,
      rate
    );
  };

  /*
    English and Japanese will eventually use
    their own pronunciation modules.

    We deliberately do not display Mandarin
    pronunciation information for them.
  */
  if (!isMandarin) {
    return (
      <div
        className="pronunciation-modal"
        role="dialog"
        aria-modal="true"
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
              {languageId?.toLowerCase() ===
              "japanese"
                ? "Japanese pronunciation"
                : "English pronunciation"}
            </h2>

            <p>
              The language-specific pronunciation
              data is not connected yet.
            </p>
          </div>
        </div>
      </div>
    );
  }

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
              tones[activeSyllable] || 0
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
            {pinyin ||
              "Pronunciation unavailable"}
          </p>

          <span className="popup-meaning">
            {vocabulary.meaning}
          </span>
        </div>

        {syllables.length > 0 ? (
          <div className="pronunciation-syllables">
            {syllables.map(
              (syllable, index) => {
                const tone = tones[index];

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
                      playSyllable(index)
                    }
                  >
                    <span className="syllable-number">
                      {String(
                        index + 1
                      ).padStart(2, "0")}
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
        ) : (
          <div className="pronunciation-empty">
            <p>
              Syllable information is not
              available for this word yet.
            </p>
          </div>
        )}

        {!toneDataMatches &&
          syllables.length > 0 && (
            <p className="pronunciation-note">
              The curriculum does not provide
              one tone value for every displayed
              syllable, so VerbaLynx will not
              guess the missing information.
            </p>
          )}

        <div className="pronunciation-actions">
          <button
            type="button"
            className="pronunciation-main-button"
            onClick={() =>
              playWord(0.65)
            }
          >
            <span>▶</span>
            Listen
          </button>

          <button
            type="button"
            className="pronunciation-slow-button"
            onClick={() =>
              playWord(0.4)
            }
          >
            Slow
          </button>
        </div>

        <div className="pronunciation-footer">
          <span>
            Listen → repeat → master
          </span>

          <span>🐾</span>
        </div>
      </div>
    </div>
  );
}

export default PronunciationPopup;