import json
import re
from pathlib import Path


INPUT_FILE = Path(
    "data/processed/curriculum/mandarin/hsk.json"
)

OUTPUT_FILE = Path(
    "data/processed/curriculum/mandarin/hsk.json"
)


TONE_MAP = {
    "ā": 1, "á": 2, "ǎ": 3, "à": 4,
    "ē": 1, "é": 2, "ě": 3, "è": 4,
    "ī": 1, "í": 2, "ǐ": 3, "ì": 4,
    "ō": 1, "ó": 2, "ǒ": 3, "ò": 4,
    "ū": 1, "ú": 2, "ǔ": 3, "ù": 4,
    "ǖ": 1, "ǘ": 2, "ǚ": 3, "ǜ": 4,
    "Ā": 1, "Á": 2, "Ǎ": 3, "À": 4,
    "Ē": 1, "É": 2, "Ě": 3, "È": 4,
    "Ī": 1, "Í": 2, "Ǐ": 3, "Ì": 4,
    "Ō": 1, "Ó": 2, "Ǒ": 3, "Ò": 4,
    "Ū": 1, "Ú": 2, "Ǔ": 3, "Ù": 4,
    "Ǖ": 1, "Ǘ": 2, "Ǚ": 3, "Ǜ": 4,
}


def get_tone(syllable):
    for character in syllable:
        if character in TONE_MAP:
            return TONE_MAP[character]

    return 5


def extract_tones(pinyin):
    syllables = pinyin.split()
    return [get_tone(syllable) for syllable in syllables]


def main():
    with INPUT_FILE.open(
        "r",
        encoding="utf-8"
    ) as file:
        entries = json.load(file)

    for entry in entries:
        pinyin = entry["pronunciation"]["pinyin"]

        entry["pronunciation"]["tones"] = (
            extract_tones(pinyin)
        )

    with OUTPUT_FILE.open(
        "w",
        encoding="utf-8"
    ) as file:
        json.dump(
            entries,
            file,
            ensure_ascii=False,
            indent=2
        )

    print(
        f"Updated {len(entries):,} entries"
    )


if __name__ == "__main__":
    main()