import json
from pathlib import Path


INPUT_DIR = Path("data/processed/tatoeba")
OUTPUT_DIR = Path("data/processed/tatoeba/index")


FILES = {
    "english": "english.json",
    "mandarin": "mandarin.json",
    "japanese": "japanese.json",
}


def load_sentences(language, filename):
    input_file = INPUT_DIR / filename

    print(f"Loading {language}...")

    with input_file.open(
        "r",
        encoding="utf-8"
    ) as file:
        data = json.load(file)

    print(f"  Loaded {len(data):,} sentences")

    return data


def build_index(language, sentences):
    index = []

    seen = set()

    for sentence in sentences:
        text = sentence.get("text", "").strip()

        if not text:
            continue

        normalized = " ".join(text.split())

        if normalized in seen:
            continue

        seen.add(normalized)

        index.append({
            "id": sentence["id"],
            "language": language,
            "text": normalized,
            "source": sentence["source"],
        })

    return index


def save_index(language, index):
    OUTPUT_DIR.mkdir(
        parents=True,
        exist_ok=True
    )

    output_file = (
        OUTPUT_DIR / f"{language}.json"
    )

    with output_file.open(
        "w",
        encoding="utf-8"
    ) as file:
        json.dump(
            index,
            file,
            ensure_ascii=False,
            separators=(",", ":")
        )

    print(
        f"  Saved {len(index):,} unique sentences"
    )


def main():
    print("Building Tatoeba sentence indexes...")
    print()

    total = 0

    for language, filename in FILES.items():
        sentences = load_sentences(
            language,
            filename
        )

        index = build_index(
            language,
            sentences
        )

        save_index(
            language,
            index
        )

        total += len(index)

        print()

    print(
        f"Total indexed sentences: {total:,}"
    )
    print(
        f"Output: {OUTPUT_DIR}"
    )


if __name__ == "__main__":
    main()