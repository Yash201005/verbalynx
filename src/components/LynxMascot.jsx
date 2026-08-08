function LynxMascot({ outfit = "default", size = "medium" }) {
  const outfits = {
    default: "🐈",
    english: "🤠",
    mandarin: "🧧",
    japanese: "🎎",
  };

  return (
    <div className={`lynx lynx-${size}`}>
      <span className="lynx-body">🐈</span>
      <span className="lynx-outfit">
        {outfits[outfit]}
      </span>
    </div>
  );
}

export default LynxMascot;