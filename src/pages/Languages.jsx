import { Link } from "react-router-dom";
import { languages } from "../data/languages";

function Languages() {
  return (
    <div>
      <h1>My Languages</h1>

      <p>
        Choose a language to continue learning.
      </p>

      {languages.map((language) => (
        <div key={language.id}>
          <h2>
            {language.flag} {language.name}
          </h2>

          <p>{language.nativeName}</p>

          <p>
            Current Level: {language.level}
          </p>

          <p>
            Overall Score: {language.score}/100
          </p>

          <Link to={`/languages/${language.id}`}>
            Open Workspace
          </Link>
        </div>
      ))}
    </div>
  );
}

export default Languages;