import { useEffect, useRef, useState } from "react";
import HanziWriter from "hanzi-writer";

function CharacterPractice({
  character,
  pinyin,
  tone,
}) {
  const writerRef = useRef(null);
  const containerRef = useRef(null);

  const [isAnimating, setIsAnimating] =
    useState(false);

  useEffect(() => {
    if (!containerRef.current || !character) {
      return;
    }

    containerRef.current.innerHTML = "";

    const writer = HanziWriter.create(
      containerRef.current,
      character,
      {
        width: 180,
        height: 180,
        padding: 12,

        showOutline: true,
        showCharacter: true,

        strokeAnimationSpeed: 0.8,
        strokeHighlightSpeed: 1.5,

        strokeColor: "#302d29",
        radicalColor: "#b58b59",
        highlightColor: "#c69b63",
        outlineColor: "#d8cfc2",
      }
    );

    writerRef.current = writer;

    return () => {
      writer.cancelQuiz?.();
      writerRef.current = null;
    };
  }, [character]);

  const animateCharacter = () => {
    if (!writerRef.current) return;

    setIsAnimating(true);

    writerRef.current.animateCharacter({
      onComplete: () => {
        setIsAnimating(false);
      },
    });
  };

  const animateStroke = (strokeNumber) => {
    if (!writerRef.current) return;

    writerRef.current.animateStroke(
      strokeNumber
    );
  };

  return (
    <section className="character-practice">
      <div className="character-practice-header">
        <div>
          <span className="content-label">
            CHARACTER & PRONUNCIATION
          </span>

          <h3>{character}</h3>

          <p className="character-pinyin">
            {pinyin}
          </p>
        </div>

        <div className="character-tone">
          Tone {tone}
        </div>
      </div>

      <div className="character-practice-body">
        <div
          ref={containerRef}
          className="character-writer"
        />

        <div className="character-controls">
          <button
            type="button"
            onClick={animateCharacter}
            disabled={isAnimating}
            className="character-control primary"
          >
            {isAnimating
              ? "Playing..."
              : "Show stroke order"}
          </button>

          <button
            type="button"
            onClick={() =>
              animateStroke(0)
            }
            className="character-control"
          >
            Stroke 1
          </button>
        </div>
      </div>

      <div className="character-learning-tip">
        <strong>
          Watch → listen → repeat
        </strong>

        <span>
          Follow the stroke order while saying{" "}
          <b>{pinyin}</b> with the correct tone.
        </span>
      </div>
    </section>
  );
}

export default CharacterPractice;