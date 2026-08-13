import json
from pathlib import Path


INPUT_FILE = Path(
    "data/processed/curriculum/mandarin/hsk_with_examples.json"
)

OUTPUT_FILE = Path(
    "data/processed/curriculum/mandarin/curriculum.json"
)

WORDS_PER_UNIT = 20


TOPICS = [
    ("Greetings & Introductions", [
        "你好",
        "您好",
        "再见",
        "谢谢",
        "不客气",
        "对不起",
        "没关系",
        "请",
        "叫",
        "名字",
    ]),

    ("People & Family", [
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
    ]),

    ("Numbers & Time", [
        "一",
        "二",
        "三",
        "四",
        "五",
        "六",
        "七",
        "八",
        "九",
        "十",
        "今天",
        "明天",
        "昨天",
        "现在",
        "时间",
    ]),

    ("Food & Drinks", [
        "吃",
        "喝",
        "水",
        "茶",
        "饭",
        "米饭",
        "水果",
        "喜欢",
        "买",
    ]),

    ("Daily Life", [
        "去",
        "来",
        "回",
        "看",
        "听",
        "说",
        "读",
        "写",
        "学习",
        "工作",
        "住",
        "睡觉",
    ]),

    ("Places & Directions", [
        "家",
        "学校",
        "商店",
        "医院",
        "这里",
        "那里",
        "上",
        "下",
        "里",
        "外",
    ]),

    ("Descriptions", [
        "大",
        "小",
        "多",
        "少",
        "好",
        "坏",
        "高",
        "热",
        "冷",
        "漂亮",
        "忙",
    ]),
]


def main():
    # ---------------------------------------------------------
    # Load HSK vocabulary
    # ---------------------------------------------------------

    with INPUT_FILE.open(
        "r",
        encoding="utf-8"
    ) as file:
        vocabulary = json.load(file)

    hsk1 = {
        entry["word"]: entry
        for entry in vocabulary
        if entry["level"] == "HSK 1"
    }

    used = set()
    units = []

    # ---------------------------------------------------------
    # 1. Build themed units
    # ---------------------------------------------------------

    for unit_number, (title, words) in enumerate(
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

            vocabulary_entries.append(entry)
            used.add(word)

        if not vocabulary_entries:
            continue

        units.append({
            "id": f"hsk1-unit-{unit_number}",
            "level": "HSK 1",
            "unitNumber": unit_number,
            "title": title,
            "vocabulary": vocabulary_entries
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

        unit_number = len(units) + 1

        units.append({
            "id": f"hsk1-unit-{unit_number}",
            "level": "HSK 1",
            "unitNumber": unit_number,
            "title": (
                f"Everyday Words "
                f"{remaining_unit_number}"
            ),
            "vocabulary": chunk
        })

        remaining_unit_number += 1

    # ---------------------------------------------------------
    # 4. Build final curriculum
    # ---------------------------------------------------------

    curriculum = {
        "language": "mandarin",
        "level": "HSK 1",
        "units": units
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
    # 6. Print summary
    # ---------------------------------------------------------

    print(
        f"Created {len(units)} HSK 1 units"
    )

    for unit in units:
        print(
            f'{unit["unitNumber"]}. '
            f'{unit["title"]}: '
            f'{len(unit["vocabulary"])} words'
        )


if __name__ == "__main__":
    main()