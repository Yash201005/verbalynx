import json
from pathlib import Path


BASE_DIR = Path(
    "data/processed/curriculum/mandarin"
)

WORDS_PER_LESSON = 20


def load_json(path):
    with path.open(
        "r",
        encoding="utf-8"
    ) as file:
        return json.load(file)


def main():
    all_lessons = {}

    for level_number in range(1, 7):
        level = f"HSK {level_number}"

        input_file = (
            BASE_DIR /
            f"hsk{level_number}_with_examples.json"
        )

        if not input_file.exists():
            print(
                f"{level}: missing "
                f"{input_file.name}"
            )
            continue

        vocabulary = load_json(
            input_file
        )

        lessons = []

        for start in range(
            0,
            len(vocabulary),
            WORDS_PER_LESSON
        ):
            chunk = vocabulary[
                start:start + WORDS_PER_LESSON
            ]

            lesson_number = (
                start // WORDS_PER_LESSON
            ) + 1

            lessons.append({
                "id": (
                    f"hsk{level_number}"
                    f"-{lesson_number}"
                ),
                "language": "mandarin",
                "level": level,
                "lessonNumber": lesson_number,
                "title": (
                    f"{level} — "
                    f"Lesson {lesson_number}"
                ),
                "vocabulary": chunk
            })

        output_file = (
            BASE_DIR /
            f"hsk{level_number}_lessons.json"
        )

        with output_file.open(
            "w",
            encoding="utf-8"
        ) as file:
            json.dump(
                lessons,
                file,
                ensure_ascii=False,
                indent=2
            )

        all_lessons[level] = lessons

        print(
            f"{level}: "
            f"{len(vocabulary):,} words → "
            f"{len(lessons):,} lessons"
        )

    combined_file = (
        BASE_DIR / "all_lessons.json"
    )

    with combined_file.open(
        "w",
        encoding="utf-8"
    ) as file:
        json.dump(
            all_lessons,
            file,
            ensure_ascii=False,
            indent=2
        )

    print(
        f"\nCombined output: "
        f"{combined_file}"
    )


if __name__ == "__main__":
    main()