import json
import re
from pathlib import Path

import pronouncing


INPUT_FILE = Path(
    "data/processed/curriculum/english/a1_with_pronunciation.json"
)

OUTPUT_FILE = Path(
    "data/processed/curriculum/english/a1_with_pronunciation.json"
)


CMU_TO_IPA = {
    "AA": "ɑ",
    "AE": "æ",
    "AH": "ə",
    "AO": "ɔ",
    "AW": "aʊ",
    "AY": "aɪ",
    "EH": "ɛ",
    "ER": "ɝ",
    "EY": "eɪ",
    "IH": "ɪ",
    "IY": "i",
    "OW": "oʊ",
    "OY": "ɔɪ",
    "UH": "ʊ",
    "UW": "u",

    "B": "b",
    "CH": "tʃ",
    "D": "d",
    "DH": "ð",
    "F": "f",
    "G": "ɡ",
    "HH": "h",
    "JH": "dʒ",
    "K": "k",
    "L": "l",
    "M": "m",
    "N": "n",
    "NG": "ŋ",
    "P": "p",
    "R": "r",
    "S": "s",
    "SH": "ʃ",
    "T": "t",
    "TH": "θ",
    "V": "v",
    "W": "w",
    "Y": "j",
    "Z": "z",
    "ZH": "ʒ",
}


def load_vocabulary():
    print(
        f"Reading vocabulary from: {INPUT_FILE}"
    )

    if not INPUT_FILE.exists():
        raise FileNotFoundError(
            f"Vocabulary file not found:\n"
            f"{INPUT_FILE}"
        )

    with INPUT_FILE.open(
        "r",
        encoding="utf-8"
    ) as file:
        vocabulary = json.load(file)

    if not isinstance(
        vocabulary,
        list
    ):
        raise ValueError(
            "Vocabulary JSON must contain an array."
        )

    return vocabulary


def remove_stress(phone):
    return re.sub(
        r"[012]$",
        "",
        phone
    )


def get_stress(phone):
    match = re.search(
        r"([012])$",
        phone
    )

    if not match:
        return None

    return match.group(1)


def split_phone_syllables(phones):
    syllables = []
    current = []

    for phone in phones:
        current.append(phone)

        if get_stress(phone) is not None:
            syllables.append(current)
            current = []

    if current:
        if syllables:
            syllables[-1].extend(current)
        else:
            syllables.append(current)

    return syllables


def phone_to_ipa(phone):
    base_phone = remove_stress(phone)

    return CMU_TO_IPA.get(
        base_phone,
        base_phone
    )


def syllable_to_ipa(phones):
    stress = ""

    for phone in phones:
        phone_stress = get_stress(phone)

        if phone_stress == "1":
            stress = "ˈ"
            break

        if phone_stress == "2":
            stress = "ˌ"

    sounds = "".join(
        phone_to_ipa(phone)
        for phone in phones
    )

    return stress + sounds


def pronunciation_to_ipa(phones):
    syllables = split_phone_syllables(
        phones
    )

    return "".join(
        syllable_to_ipa(syllable)
        for syllable in syllables
    )


def find_vowel_groups(word):
    return list(
        re.finditer(
            r"[aeiouy]+",
            word,
            re.IGNORECASE
        )
    )


def fallback_split(word, count):
    if count <= 1:
        return [word]

    if not word:
        return []

    length = len(word)

    result = []
    start = 0

    for index in range(count):
        remaining_parts = count - index
        remaining_chars = length - start

        if index == count - 1:
            result.append(
                word[start:]
            )
            break

        size = max(
            1,
            remaining_chars //
            remaining_parts
        )

        result.append(
            word[
                start:start + size
            ]
        )

        start += size

    return [
        part
        for part in result
        if part
    ]


def split_spelling_by_syllables(
    word,
    syllable_count
):
    """
    Create a readable spelling split that
    corresponds to the CMU pronunciation
    syllable count.

    Examples:

        hello  -> hel | lo
        banana -> ba | na | na
        student -> student
    """

    word = str(word).strip()

    if not word:
        return []

    if syllable_count <= 1:
        return [word]

    groups = find_vowel_groups(word)

    if len(groups) < syllable_count:
        return fallback_split(
            word,
            syllable_count
        )

    boundaries = []

    for index in range(
        syllable_count - 1
    ):
        current = groups[index]
        next_group = groups[index + 1]

        current_end = current.end()
        next_start = next_group.start()

        consonants = word[
            current_end:next_start
        ]

        if not consonants:
            boundary = current_end

        elif len(consonants) == 1:
            boundary = next_start

        else:
            boundary = next_start - 1

        boundaries.append(boundary)

    result = []
    start = 0

    for boundary in boundaries:
        result.append(
            word[start:boundary]
        )

        start = boundary

    result.append(
        word[start:]
    )

    result = [
        part
        for part in result
        if part
    ]

    if len(result) != syllable_count:
        return fallback_split(
            word,
            syllable_count
        )

    return result


def get_pronunciation(word):
    normalized = (
        str(word)
        .strip()
        .lower()
    )

    if not normalized:
        return None

    pronunciations = (
        pronouncing.phones_for_word(
            normalized
        )
    )

    if not pronunciations:
        return None

    return pronunciations[0]


def build_entry(entry):
    word = str(
        entry.get(
            "word",
            ""
        )
    ).strip()

    pronunciation = get_pronunciation(
        word
    )

    result = dict(entry)

    if not pronunciation:
        result["pronunciation"] = {
            "source": {
                "name":
                    "CMU Pronouncing Dictionary",
                "available":
                    False
            }
        }

        return result

    phones = pronunciation.split()

    phone_syllables = (
        split_phone_syllables(
            phones
        )
    )

    syllable_count = len(
        phone_syllables
    )

    ipa_syllables = [
        syllable_to_ipa(
            syllable
        )
        for syllable in phone_syllables
    ]

    spelling_syllables = (
        split_spelling_by_syllables(
            word,
            syllable_count
        )
    )

    result["pronunciation"] = {
        "ipa":
            pronunciation_to_ipa(
                phones
            ),

        "syllables":
            spelling_syllables,

        "ipaSyllables":
            ipa_syllables,

        "cmu":
            pronunciation,

        "source": {
            "name":
                "CMU Pronouncing Dictionary",
            "available":
                True
        }
    }

    return result


def main():
    print(
        "Loading English vocabulary..."
    )

    vocabulary = load_vocabulary()

    print(
        f"Loaded "
        f"{len(vocabulary):,} words"
    )

    output = []

    matched = 0
    missing = 0

    for index, entry in enumerate(
        vocabulary,
        start=1
    ):
        result = build_entry(
            entry
        )

        available = (
            result
            .get(
                "pronunciation",
                {}
            )
            .get(
                "source",
                {}
            )
            .get(
                "available",
                False
            )
        )

        if available:
            matched += 1
        else:
            missing += 1

        output.append(result)

        if (
            index % 100 == 0
            or index == len(vocabulary)
        ):
            print(
                f"Processed "
                f"{index:,}/"
                f"{len(vocabulary):,}"
            )

    OUTPUT_FILE.parent.mkdir(
        parents=True,
        exist_ok=True
    )

    with OUTPUT_FILE.open(
        "w",
        encoding="utf-8"
    ) as file:
        json.dump(
            output,
            file,
            ensure_ascii=False,
            indent=2
        )

    print()
    print(
        "========================================"
    )
    print(
        "English pronunciation build complete"
    )
    print(
        "========================================"
    )
    print(
        f"Total words: {len(output):,}"
    )
    print(
        f"Matched:     {matched:,}"
    )
    print(
        f"Missing:     {missing:,}"
    )
    print(
        f"Output:      {OUTPUT_FILE}"
    )


if __name__ == "__main__":
    main()