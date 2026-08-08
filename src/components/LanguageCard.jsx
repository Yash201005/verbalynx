import { Link } from "react-router-dom";
import { ArrowUpRight } from "lucide-react";
import LynxMascot from "./LynxMascot";

function LanguageCard({ language }) {
  return (
    <Link
      to={`/languages/${language.id}`}
      className={`language-card language-${language.id}`}
    >
      <div className="language-card-top">
        <span className="language-flag">
          {language.flag}
        </span>

        <ArrowUpRight size={17} />
      </div>

      <div className="language-mascot">
        <LynxMascot outfit={language.id} />
      </div>

      <div className="language-card-info">
        <p>{language.level}</p>

        <h3>{language.name}</h3>

        <span>{language.nativeName}</span>
      </div>

      <div className="language-progress">
        <div className="progress-meta">
          <span>Progress</span>
          <strong>{language.score}%</strong>
        </div>

        <div className="progress-track">
          <div
            className="progress-bar"
            style={{
              width: `${language.score}%`,
            }}
          />
        </div>

        <div className="progress-runner">
          🐾
        </div>
      </div>

      <span className="language-continue">
        Continue learning →
      </span>
    </Link>
  );
}

export default LanguageCard;