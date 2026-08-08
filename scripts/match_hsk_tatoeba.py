import json
from pathlib import Path

import jieba


HSK_FILE = Path(
    "data/processed/curriculum/mandarin/hsk.json"
)

TATOEBA_FILE = Path(
    "data/processed/tatoeba/index/mandarin.json"
)

OUTPUT_FILE = Path(
    "data/processed/curriculum/mandarin/hsk1_with_examples.json"
)


MAX_EXAMPLES = 5
MAX_SENTENCE_LENGTH = 30


def main():
    with HSK_FILE.open(
        "r",
        encoding="utf-8"
    ) as file:
        hsk_entries = json.load(file)

    with TATOEBA_FILE.open(
        "r",
        encoding="utf-8"
    ) as file:
        sentences = json.load(file)

    hsk1 = [
        entry
        for entry in hsk_entries
        if entry["level"] == "HSK 1"
    ]

    print(f"HSK 1 words: {len(hsk1):,}")
    print(f"Sentences: {len(sentences):,}")

    sentence_tokens = []

    for sentence in sentences:
        text = sentence["text"].strip()

        if len(text) > MAX_SENTENCE_LENGTH:
            continue

        tokens = set(jieba.cut(text))

        sentence_tokens.append(
            (
                sentence["id"],
                text,
                tokens
            )
        )

    for entry in hsk1:
        word = entry["word"]

        examples = []

        for sentence_id, text, tokens in sentence_tokens:
            if word in tokens:
                examples.append({
                    "id": sentence_id,
                    "text": text
                })

                if len(examples) >= MAX_EXAMPLES:
                    break

        entry["examples"] = examples

    OUTPUT_FILE.parent.mkdir(
        parents=True,
        exist_ok=True
    )

    with OUTPUT_FILE.open(
        "w",
        encoding="utf-8"
    ) as file:
        json.dump(
            hsk1,
            file,
            ensure_ascii=False,
            indent=2
        )

    matched = sum(
        1
        for entry in hsk1
        if entry["examples"]
    )

    total_examples = sum(
        len(entry["examples"])
        for entry in hsk1
    )

    print()
    print(
        f"Matched: {matched:,}/{len(hsk1):,}"
    )
    print(
        f"Examples found: {total_examples:,}"
    )
    print(
        f"Output: {OUTPUT_FILE}"
    )


if __name__ == "__main__":
    main()