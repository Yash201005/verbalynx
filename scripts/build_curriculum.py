import json
from pathlib import Path


BASE_DIR = Path(
    "data/processed/curriculum/mandarin"
)

INPUT_FILE = (
    BASE_DIR /
    "hsk1_with_examples.json"
)

OUTPUT_FILE = (
    BASE_DIR /
    "curriculum.json"
)

WORDS_PER_UNIT = 20


TOPICS = [
    (
        "Greetings & Introductions",
        [
            "你好",
            "您好",
            "再见",
            "谢谢",
            "不客气",
            "对不起",
            "没关系",
            "请",
            "喂",
            "叫",
        ],
    ),

    (
        "People & Family",
        [
            "我",
            "你",
            "他",
            "她",
            "我们",
            "你们",
            "他们",
            "爸爸",
            "妈妈",
            "朋友",
            "学生",
            "老师",
            "家",
        ],
    ),

    (
        "Numbers & Time",
        [
            "一",
            "二",
            "三",
            "四",
            "五",
            "六",
            "七",
            "八",
            "九",
            "今天",
            "明天",
            "昨天",
            "现在",
            "时间",
        ],
    ),

    (
        "Food & Drinks",
        [
            "吃",
            "喝",
            "说",
            "读",
            "写",
            "喜欢",
            "工作",
            "学习",
            "做",
            "多",
            "少",
            "好",
            "大",
            "高",
            "热",
            "冷",
            "漂亮",
            "忙",
        ],
    ),
]


def load_json(path):
    with path.open(
        "r",
        encoding="utf-8"
    ) as file:
        return json.load(file)


def main():
    # ---------------------------------------------------------
    # Load HSK 1 vocabulary with examples AND pronunciation
    # ---------------------------------------------------------

    vocabulary = load_json(
        INPUT_FILE
    )

    print(
        f"Loaded {len(vocabulary):,} "
        f"HSK 1 vocabulary entries"
    )

    # ---------------------------------------------------------
    # Index vocabulary by word
    # ---------------------------------------------------------

    hsk1 = {
        entry["word"]: entry
        for entry in vocabulary
        if entry.get("level") == "HSK 1"
    }

    used = set()
    units = []

    # ---------------------------------------------------------
    # 1. Build themed units
    # ---------------------------------------------------------

    for unit_number, (
        title,
        words
    ) in enumerate(
        TOPICS,
        start=1
    ):
        vocabulary_entries = []

        for word in words:
            entry = hsk1.get(word)

            if not entry:
                continue

            if word in used:
                continue

            vocabulary_entries.append(
                entry
            )

            used.add(word)

        if not vocabulary_entries:
            continue

        units.append({
            "id": (
                f"hsk1-unit-{unit_number}"
            ),
            "level": "HSK 1",
            "unitNumber": unit_number,
            "title": title,
            "vocabulary": vocabulary_entries,
        })

    # ---------------------------------------------------------
    # 2. Find remaining HSK 1 vocabulary
    # ---------------------------------------------------------

    remaining = [
        entry
        for word, entry in hsk1.items()
        if word not in used
    ]

    # ---------------------------------------------------------
    # 3. Split remaining vocabulary into 20-word units
    # ---------------------------------------------------------

    remaining_unit_number = 1

    for start in range(
        0,
        len(remaining),
        WORDS_PER_UNIT
    ):
        chunk = remaining[
            start:start + WORDS_PER_UNIT
        ]

        unit_number = (
            len(units) + 1
        )

        units.append({
            "id": (
                f"hsk1-unit-{unit_number}"
            ),
            "level": "HSK 1",
            "unitNumber": unit_number,
            "title": (
                f"Everyday Words "
                f"{remaining_unit_number}"
            ),
            "vocabulary": chunk,
        })

        remaining_unit_number += 1

    # ---------------------------------------------------------
    # 4. Build final curriculum
    # ---------------------------------------------------------

    curriculum = {
        "language": "mandarin",
        "level": "HSK 1",
        "units": units,
    }

    # ---------------------------------------------------------
    # 5. Save curriculum
    # ---------------------------------------------------------

    OUTPUT_FILE.parent.mkdir(
        parents=True,
        exist_ok=True
    )

    with OUTPUT_FILE.open(
        "w",
        encoding="utf-8"
    ) as file:
        json.dump(
            curriculum,
            file,
            ensure_ascii=False,
            indent=2
        )

    # ---------------------------------------------------------
    # 6. Verify pronunciation data survived
    # ---------------------------------------------------------

    pronunciation_count = 0
    syllable_count = 0
    tone_count = 0

    for unit in units:
        for entry in unit["vocabulary"]:
            pronunciation = entry.get(
                "pronunciation",
                {}
            )

            if pronunciation:
                pronunciation_count += 1

            if pronunciation.get(
                "syllables"
            ):
                syllable_count += 1

            if pronunciation.get(
                "tones"
            ):
                tone_count += 1

    # ---------------------------------------------------------
    # 7. Print summary
    # ---------------------------------------------------------

    print(
        f"Created {len(units)} "
        f"HSK 1 units"
    )

    for unit in units:
        print(
            f'{unit["unitNumber"]}. '
            f'{unit["title"]}: '
            f'{len(unit["vocabulary"])} words'
        )

    print()
    print(
        "Pronunciation verification:"
    )

    print(
        f"  Entries with pronunciation: "
        f"{pronunciation_count:,}"
    )

    print(
        f"  Entries with syllables: "
        f"{syllable_count:,}"
    )

    print(
        f"  Entries with tones: "
        f"{tone_count:,}"
    )

    print(
        f"\nOutput: {OUTPUT_FILE}"
    )


if __name__ == "__main__":
    main()