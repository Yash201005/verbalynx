import csv
import json
from pathlib import Path


RAW_DIR = Path("data/raw/tatoeba")
OUTPUT_DIR = Path("data/processed/tatoeba")

FILES = {
    "english": "eng_sentences.tsv",
    "mandarin": "cmn_sentences.tsv",
    "japanese": "jpn_sentences.tsv",
}


def read_sentences(language, filename):
    file_path = RAW_DIR / filename

    if not file_path.exists():
        print(f"Missing file: {file_path}")
        return []

    sentences = []

    with file_path.open(
        "r",
        encoding="utf-8-sig",
        newline=""
    ) as file:
        reader = csv.reader(
            file,
            delimiter="\t"
        )

        for row in reader:
            if len(row) < 3:
                continue

            sentence_id = row[0].strip()
            language_code = row[1].strip()
            text = row[2].strip()

            if not sentence_id or not text:
                continue

            sentences.append({
                "id": sentence_id,
                "language": language,
                "languageCode": language_code,
                "text": text,
                "source": {
                    "name": "Tatoeba",
                    "license": "CC BY 2.0 FR",
                },
            })

    return sentences


def save_json(language, sentences):
    OUTPUT_DIR.mkdir(
        parents=True,
        exist_ok=True
    )

    output_file = OUTPUT_DIR / f"{language}.json"

    with output_file.open(
        "w",
        encoding="utf-8"
    ) as file:
        json.dump(
            sentences,
            file,
            ensure_ascii=False,
            indent=2
        )

    print(
        f"{language}: "
        f"{len(sentences):,} sentences"
    )


def main():
    print("Importing Tatoeba data...")
    print()

    total = 0

    for language, filename in FILES.items():
        sentences = read_sentences(
            language,
            filename
        )

        save_json(
            language,
            sentences
        )

        total += len(sentences)

    print()
    print(
        f"Total imported: {total:,} sentences"
    )
    print(
        f"Processed data: {OUTPUT_DIR}"
    )


if __name__ == "__main__":
    main()