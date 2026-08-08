import json
from pathlib import Path


HSK_FILE = Path(
    "data/processed/curriculum/mandarin/hsk.json"
)

TATOEBA_FILE = Path(
    "data/processed/tatoeba/index/mandarin.json"
)

OUTPUT_FILE = Path(
    "data/processed/curriculum/mandarin/hsk1_with_examples.json"
)


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

    for entry in hsk1:
        word = entry["word"]

        examples = []

        for sentence in sentences:
            text = sentence["text"]

            if word in text:
                examples.append({
                    "id": sentence["id"],
                    "text": text
                })

                if len(examples) >= 5:
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
        1 for entry in hsk1
        if entry["examples"]
    )

    print()
    print(f"Matched: {matched:,}/{len(hsk1):,}")
    print(f"Output: {OUTPUT_FILE}")


if __name__ == "__main__":
    main()