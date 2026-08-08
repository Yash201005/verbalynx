import json

path = "data/raw/dictionary/mandarin/kaikki.org-dictionary-Mandarin.jsonl"

targets = {
    "你好",
    "学生",
    "吃",
    "喝",
    "朋友",
    "中国",
    "喜欢",
    "谢谢",
    "再见",
}

found = set()

with open(path, encoding="utf-8") as file:
    for line in file:
        entry = json.loads(line)

        word = entry.get("word")

        if word not in targets:
            continue

        if entry.get("pos") == "romanization":
            continue

        print(json.dumps(
            entry,
            ensure_ascii=False,
            indent=2
        ))

        print("\n" + "=" * 80 + "\n")

        found.add(word)

        if found == targets:
            break

print("Found:", ", ".join(sorted(found)))
print("Missing:", ", ".join(sorted(targets - found)))