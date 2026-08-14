import json
import re
from pathlib import Path

import pronouncing


BASE_DIR = Path(
    "data/processed/curriculum/english"
)

INPUT_FILE = Path(
    "src/data/content/english/vocabulary/a1.js"
)

OUTPUT_FILE = (
    BASE_DIR /
    "a1_with_pronunciation.json"
)


# =========================================================
# JAVASCRIPT VOCABULARY LOADING
# =========================================================

def extract_array(text):
    start = text.find("[")

    if start == -1:
        raise ValueError(
            "Could not find the beginning of the vocabulary array."
        )

    depth = 0
    in_string = False
    string_quote = None
    escaped = False

    for index in range(
        start,
        len(text)
    ):
        character = text[index]

        if in_string:
            if escaped:
                escaped = False
                continue

            if character == "\\":
                escaped = True
                continue

            if character == string_quote:
                in_string = False
                string_quote = None

            continue

        if character in ('"', "'"):
            in_string = True
            string_quote = character
            continue

        if character == "[":
            depth += 1

        elif character == "]":
            depth -= 1

            if depth == 0:
                return text[
                    start:index + 1
                ]

    raise ValueError(
        "Could not find the end of the vocabulary array."
    )


def convert_js_to_json(text):
    text = re.sub(
        r"//.*?$",
        "",
        text,
        flags=re.MULTILINE
    )

    text = re.sub(
        r"/\*.*?\*/",
        "",
        text,
        flags=re.DOTALL
    )

    def convert_single_quotes(match):
        value = match.group(1)

        value = value.replace(
            '"',
            '\\"'
        )

        return f'"{value}"'

    text = re.sub(
        r"'([^'\\]*(?:\\.[^'\\]*)*)'",
        convert_single_quotes,
        text
    )

    text = re.sub(
        r'([{,]\s*)([A-Za-z_$][A-Za-z0-9_$]*)\s*:',
        r'\1"\2":',
        text
    )

    text = re.sub(
        r",(\s*[}\]])",
        r"\1",
        text
    )

    return text


def load_vocabulary():
    print(
        f"Reading vocabulary from: "
        f"{INPUT_FILE}"
    )

    if not INPUT_FILE.exists():
        raise FileNotFoundError(
            f"Vocabulary file not found:\n"
            f"{INPUT_FILE}"
        )

    text = INPUT_FILE.read_text(
        encoding="utf-8"
    )

    array_text = extract_array(
        text
    )

    json_text = convert_js_to_json(
        array_text
    )

    vocabulary = json.loads(
        json_text
    )

    if not isinstance(
        vocabulary,
        list
    ):
        raise ValueError(
            "Vocabulary file did not contain an array."
        )

    return vocabulary


# =========================================================
# CMU PRONUNCIATION
# =========================================================

def normalize_word(word):
    return (
        str(word)
        .strip()
        .lower()
    )


def get_pronunciation(word):
    normalized = normalize_word(
        word
    )

    if not normalized:
        return None

    pronunciations = (
        pronouncing
        .phones_for_word(
            normalized
        )
    )

    if not pronunciations:
        return None

    return pronunciations[0]


def remove_stress(phone):
    return re.sub(
        r"[012]$",
        "",
        phone
    )


def phone_has_stress(phone):
    return bool(
        re.search(
            r"[012]$",
            phone
        )
    )


def split_into_syllables(phones):
    syllables = []
    current = []

    for phone in phones:
        current.append(
            phone
        )

        if phone_has_stress(
            phone
        ):
            syllables.append(
                current
            )

            current = []

    if current:
        if syllables:
            syllables[-1].extend(
                current
            )
        else:
            syllables.append(
                current
            )

    return syllables


# =========================================================
# CMU → IPA
# =========================================================

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


def phoneme_to_ipa(phone):
    base = remove_stress(
        phone
    )

    return CMU_TO_IPA.get(
        base,
        base
    )


def syllable_to_ipa(phones):
    result = ""

    stress = None

    for phone in phones:
        if phone.endswith("1"):
            stress = "ˈ"

        elif phone.endswith("2"):
            if stress is None:
                stress = "ˌ"

        result += phoneme_to_ipa(
            phone
        )

    if stress:
        return stress + result

    return result


def pronunciation_to_ipa(phones):
    syllables = split_into_syllables(
        phones
    )

    return "".join(
        syllable_to_ipa(
            syllable
        )
        for syllable in syllables
    )


# =========================================================
# VISUAL SPELLING SYLLABLES
# =========================================================

def split_word_using_syllable_count(
    word,
    syllable_count
):
    """
    Create a simple visual spelling breakdown
    matching the number of actual pronunciation
    syllables.

    This is a display aid, not the pronunciation source.
    """

    word = str(word).strip()

    if not word:
        return []

    if syllable_count <= 1:
        return [word]

    letters = list(word)

    if len(letters) <= syllable_count:
        return letters

    # -----------------------------------------------------
    # Find vowel groups.
    # -----------------------------------------------------

    vowel_pattern = re.compile(
        r"[aeiouy]+",
        re.IGNORECASE
    )

    vowel_matches = list(
        vowel_pattern.finditer(
            word
        )
    )

    # If we don't have enough vowel groups,
    # fall back to an even visual split.
    if len(vowel_matches) < syllable_count:
        return fallback_split(
            word,
            syllable_count
        )

    boundaries = []

    for match in vowel_matches[
        :syllable_count - 1
    ]:
        boundary = match.end()

        # Move the boundary back slightly when
        # there is a consonant cluster.
        while (
            boundary < len(word)
            and word[boundary].lower()
            not in "aeiouy"
        ):
            if (
                boundary + 1 < len(word)
                and word[
                    boundary + 1
                ].lower()
                in "aeiouy"
            ):
                break

            boundary += 1

        boundaries.append(
            boundary
        )

    if not boundaries:
        return fallback_split(
            word,
            syllable_count
        )

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

    # Make sure the count matches.
    if len(result) != syllable_count:
        return fallback_split(
            word,
            syllable_count
        )

    return result


def fallback_split(
    word,
    count
):
    if count <= 1:
        return [word]

    length = len(word)

    result = []

    start = 0

    for index in range(count):
        remaining_parts = count - index

        remaining_chars = (
            length - start
        )

        size = max(
            1,
            remaining_chars //
            remaining_parts
        )

        if index == count - 1:
            result.append(
                word[start:]
            )
        else:
            result.append(
                word[
                    start:
                    start + size
                ]
            )

        start += size

    return [
        part
        for part in result
        if part
    ]


# =========================================================
# BUILD ENTRY
# =========================================================

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

    entry_copy = dict(
        entry
    )

    existing = entry.get(
        "pronunciation",
        {}
    )

    if not isinstance(
        existing,
        dict
    ):
        existing = {}

    if not pronunciation:
        entry_copy[
            "pronunciation"
        ] = {
            **existing,
            "source": {
                "name":
                    "CMU Pronouncing Dictionary",
                "available":
                    False
            }
        }

        return entry_copy

    phones = pronunciation.split()

    phoneme_syllables = (
        split_into_syllables(
            phones
        )
    )

    syllable_count = len(
        phoneme_syllables
    )

    ipa_syllables = [
        syllable_to_ipa(
            syllable
        )
        for syllable in phoneme_syllables
    ]

    ipa = pronunciation_to_ipa(
        phones
    )

    visual_syllables = (
        split_word_using_syllable_count(
            word,
            syllable_count
        )
    )

    entry_copy[
        "pronunciation"
    ] = {
        "ipa": ipa,

        "syllables":
            visual_syllables,

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

    return entry_copy


# =========================================================
# MAIN
# =========================================================

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

        output.append(
            result
        )

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