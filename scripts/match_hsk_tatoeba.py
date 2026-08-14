import csv
import json
import re
from pathlib import Path


BASE_DIR = Path("data/processed/curriculum/mandarin")

HSK_FILE = BASE_DIR / "hsk_with_tones.json"

CMN_FILE = Path("data/raw/tatoeba/cmn_sentences.tsv")
ENG_FILE = Path("data/raw/tatoeba/eng_sentences.tsv")
LINKS_FILE = Path("data/raw/tatoeba/links.csv")

MAX_EXAMPLES = 3
MAX_CHINESE_LENGTH = 12


def load_json(path):
    with path.open("r", encoding="utf-8") as file:
        return json.load(file)


def load_sentences(path):
    sentences = {}

    with path.open(
        "r",
        encoding="utf-8",
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

            if not sentence_id.isdigit():
                continue

            sentences[sentence_id] = {
                "language": row[1].strip(),
                "text": row[2].strip()
            }

    return sentences


def load_links(path):
    links = []

    with path.open(
        "r",
        encoding="utf-8"
    ) as file:
        for line in file:
            parts = re.split(
                r"[\t ]+",
                line.strip()
            )

            if len(parts) < 2:
                continue

            first_id = parts[0]
            second_id = parts[1]

            if not (
                first_id.isdigit()
                and second_id.isdigit()
            ):
                continue

            links.append(
                (first_id, second_id)
            )

    return links


def build_translations(
    links,
    cmn,
    eng
):
    translations = {}

    for first_id, second_id in links:
        first = cmn.get(first_id)
        second = cmn.get(second_id)

        first_eng = eng.get(first_id)
        second_eng = eng.get(second_id)

        if first and second_eng:
            translations.setdefault(
                first_id,
                []
            ).append(
                second_eng["text"]
            )

        if second and first_eng:
            translations.setdefault(
                second_id,
                []
            ).append(
                first_eng["text"]
            )

    return translations


def chinese_length(text):
    return sum(
        "\u4e00" <= char <= "\u9fff"
        for char in text
    )


def contains_latin(text):
    return bool(
        re.search(
            r"[A-Za-z]",
            text
        )
    )


def contains_unusual_symbols(text):
    return bool(
        re.search(
            r"[^\u4e00-\u9fff"
            r"\u3000-\u303f"
            r"\uff00-\uffef"
            r"\s"
            r"!！?？。．，,、：:；;（）()]",
            text
        )
    )


def clean_translation(text):
    text = text.strip()

    if not text:
        return None

    return text


def sentence_score(sentence):
    text = sentence["text"]
    translation = sentence["translation"]

    chinese_len = chinese_length(text)

    return (
        chinese_len,
        len(translation)
    )


def main():
    csv.field_size_limit(10**7)

    print("Loading HSK vocabulary...")

    vocabulary = load_json(
        HSK_FILE
    )

    print(
        f"Loaded {len(vocabulary):,} HSK entries"
    )

    print("Loading Tatoeba...")

    cmn = load_sentences(
        CMN_FILE
    )

    eng = load_sentences(
        ENG_FILE
    )

    links = load_links(
        LINKS_FILE
    )

    print(
        f"Chinese sentences: {len(cmn):,}"
    )

    print(
        f"English sentences: {len(eng):,}"
    )

    print(
        f"Links: {len(links):,}"
    )

    print("Building translation index...")

    translations = build_translations(
        links,
        cmn,
        eng
    )

    print(
        f"Translated sentences: "
        f"{len(translations):,}"
    )

    # ---------------------------------------------------------
    # Group vocabulary by level
    # ---------------------------------------------------------

    levels = {}

    for entry in vocabulary:
        level = entry.get("level")

        if level:
            levels.setdefault(
                level,
                []
            ).append(entry)

    # ---------------------------------------------------------
    # Pre-filter clean Tatoeba sentences
    # ---------------------------------------------------------

    candidates = []

    for sentence_id, sentence in cmn.items():
        text = sentence["text"].strip()

        if not text:
            continue

        length = chinese_length(text)

        if length == 0:
            continue

        if length > MAX_CHINESE_LENGTH:
            continue

        if contains_latin(text):
            continue

        if contains_unusual_symbols(text):
            continue

        english_versions = translations.get(
            sentence_id,
            []
        )

        if not english_versions:
            continue

        translation = clean_translation(
            english_versions[0]
        )

        if not translation:
            continue

        candidates.append({
            "id": sentence_id,
            "text": text,
            "translation": translation
        })

    print(
        f"Clean Tatoeba candidates: "
        f"{len(candidates):,}"
    )

    # ---------------------------------------------------------
    # Match each HSK level
    # ---------------------------------------------------------

    for level_number in range(1, 7):
        level = f"HSK {level_number}"

        entries = levels.get(
            level,
            []
        )

        if not entries:
            print(
                f"{level}: no entries found"
            )
            continue

        print(
            f"\nProcessing {level}..."
        )

        output = []

        for index, entry in enumerate(
            entries,
            start=1
        ):
            word = entry["word"]

            matches = []

            for candidate in candidates:
                if word in candidate["text"]:
                    matches.append(
                        candidate
                    )

            matches.sort(
                key=sentence_score
            )

            entry_copy = dict(entry)

            entry_copy["examples"] = [
                {
                    "id": item["id"],
                    "text": item["text"],
                    "translation": item[
                        "translation"
                    ]
                }
                for item in matches[
                    :MAX_EXAMPLES
                ]
            ]

            output.append(
                entry_copy
            )

            if index % 500 == 0:
                print(
                    f"  Processed "
                    f"{index:,}/{len(entries):,}"
                )

        output_file = (
            BASE_DIR /
            f"hsk{level_number}_with_examples.json"
        )

        with output_file.open(
            "w",
            encoding="utf-8"
        ) as file:
            json.dump(
                output,
                file,
                ensure_ascii=False,
                indent=2
            )

        matched_count = sum(
            bool(entry["examples"])
            for entry in output
        )

        total_examples = sum(
            len(entry["examples"])
            for entry in output
        )

        print(
            f"{level}: "
            f"{len(output):,} words | "
            f"{matched_count:,} with examples | "
            f"{total_examples:,} examples"
        )

        print(
            f"Output: {output_file}"
        )

    print("\nDone.")


if __name__ == "__main__":
    main()