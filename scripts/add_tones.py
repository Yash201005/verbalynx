import json
from pathlib import Path

from pypinyin import pinyin, Style


INPUT_FILE = Path(
    "data/processed/curriculum/mandarin/hsk.json"
)

OUTPUT_FILE = Path(
    "data/processed/curriculum/mandarin/hsk_with_tones.json"
)


def extract_pronunciation(word):
    """
    Generate Mandarin pronunciation data from
    Chinese characters using pypinyin.

    Returns:
        {
            "syllables": ["zài", "jiàn"],
            "tones": [4, 4]
        }
    """

    if not word:
        return {
            "syllables": [],
            "tones": [],
        }

    numbered_result = pinyin(
        word,
        style=Style.TONE3,
        heteronym=False
    )

    marked_result = pinyin(
        word,
        style=Style.TONE,
        heteronym=False
    )

    syllables = []
    tones = []

    for item in numbered_result:
        if not item:
            continue

        value = item[0]

        if not value:
            continue

        value = value.strip()

        if not value:
            continue

        last = value[-1]

        if last.isdigit():
            tone = int(last)

            if tone in (1, 2, 3, 4, 5):
                tones.append(tone)

    for item in marked_result:
        if not item:
            continue

        value = item[0]

        if value:
            syllables.append(
                value.strip()
            )

    return {
        "syllables": syllables,
        "tones": tones,
    }


def main():
    with INPUT_FILE.open(
        "r",
        encoding="utf-8"
    ) as file:
        vocabulary = json.load(file)

    for entry in vocabulary:
        pronunciation = entry.get(
            "pronunciation",
            {}
        )

        word = entry.get(
            "word",
            ""
        )

        pronunciation_data = (
            extract_pronunciation(word)
        )

        pronunciation["syllables"] = (
            pronunciation_data["syllables"]
        )

        pronunciation["tones"] = (
            pronunciation_data["tones"]
        )

        entry["pronunciation"] = pronunciation

    OUTPUT_FILE.parent.mkdir(
        parents=True,
        exist_ok=True
    )

    with OUTPUT_FILE.open(
        "w",
        encoding="utf-8"
    ) as file:
        json.dump(
            vocabulary,
            file,
            ensure_ascii=False,
            indent=2
        )

    print(
        f"Saved pronunciation data for "
        f"{len(vocabulary):,} entries"
    )

    print(
        f"Output: {OUTPUT_FILE}"
    )


if __name__ == "__main__":
    main()