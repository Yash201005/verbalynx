import csv
import json
from pathlib import Path


INPUT_FILE = Path(
    "data/raw/curriculum/mandarin/hsk.csv"
)

OUTPUT_DIR = Path(
    "data/processed/curriculum/mandarin"
)


def split_variants(value):
    if not value:
        return []

    return [
        item.strip()
        for item in value.split("｜")
        if item.strip()
    ]


def import_hsk():
    entries = []

    with INPUT_FILE.open(
        "r",
        encoding="utf-8-sig",
        newline=""
    ) as file:

        reader = csv.DictReader(file)

        for row in reader:
            chinese_forms = split_variants(
                row.get("chinese", "")
            )

            pinyin_forms = split_variants(
                row.get("pinyin", "")
            )

            if not chinese_forms:
                continue

            primary_word = chinese_forms[0]

            entry = {
                "id": row.get("id", "").strip(),
                "word": primary_word,
                "variants": chinese_forms[1:],
                "language": "mandarin",
                "level": f"HSK {row.get('hsk_level', '').strip()}",
                "meaning": row.get("english", "").strip(),
                "pronunciation": {
                    "pinyin": (
                        pinyin_forms[0]
                        if pinyin_forms
                        else ""
                    ),
                    "variants": pinyin_forms[1:],
                },
                "source": {
                    "name": "HSK 3.0 Vocabulary Dataset",
                    "license": "CC0 1.0",
                },
            }

            entries.append(entry)

    return entries


def save_entries(entries):
    OUTPUT_DIR.mkdir(
        parents=True,
        exist_ok=True
    )

    output_file = OUTPUT_DIR / "hsk.json"

    with output_file.open(
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
        f"Saved {len(entries):,} HSK entries"
    )

    print(
        f"Output: {output_file}"
    )


def main():
    print("Importing HSK vocabulary...")
    print()

    entries = import_hsk()

    save_entries(entries)

    print()
    print("HSK vocabulary import complete.")


if __name__ == "__main__":
    main()