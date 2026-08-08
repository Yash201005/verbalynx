import { Link, useParams } from "react-router-dom";
import {
  ArrowRight,
  BookOpen,
  Headphones,
  Mic,
  PenLine,
  Sparkles,
} from "lucide-react";

import { languages } from "../data/languages";
import SkillProgress from "../components/SkillProgress";
import BackButton from "../components/BackButton";

function LanguageWorkspace() {
  const { languageId } = useParams();

  const language = languages.find(
    (item) => item.id === languageId
  );

  if (!language) {
    return (
      <div className="workspace">
        <BackButton fallback="/languages" />
        <h1>Language not found</h1>
      </div>
    );
  }

  return (
    <div className="workspace">
      <BackButton fallback="/languages" />

      <section className="workspace-header">
        <div>
          <div className="workspace-language">
            <span>{language.flag}</span>
            <span>{language.nativeName}</span>
          </div>

          <h1>{language.name}</h1>

          <p>
            {language.level} · Overall{" "}
            <strong>{language.score}%</strong>
          </p>
        </div>

        <Link
          to={`/languages/${language.id}/curriculum`}
          className="workspace-primary"
        >
          Continue learning
          <ArrowRight size={15} />
        </Link>
      </section>

      <section className="workspace-section">
        <div className="workspace-heading">
          <p>YOUR SKILLS</p>
          <h2>How you're progressing</h2>
        </div>

        <div className="skills-grid">
          <SkillProgress
            name="Speaking"
            score={language.skills.speaking}
          />

          <SkillProgress
            name="Listening"
            score={language.skills.listening}
          />

          <SkillProgress
            name="Reading"
            score={language.skills.reading}
          />

          <SkillProgress
            name="Writing"
            score={language.skills.writing}
          />

          <SkillProgress
            name="Vocabulary"
            score={language.skills.vocabulary}
          />
        </div>
      </section>

      <section className="workspace-section">
        <div className="workspace-heading">
          <p>PRACTICE</p>
          <h2>Choose what you want to work on</h2>
        </div>

        <div className="practice-grid">
          <Link to="#" className="practice-item">
            <Mic size={20} />

            <div>
              <strong>Speaking</strong>
              <span>
                Practice conversation and articulation
              </span>
            </div>

            <ArrowRight size={15} />
          </Link>

          <Link to="#" className="practice-item">
            <Headphones size={20} />

            <div>
              <strong>Listening</strong>
              <span>
                Improve comprehension and understanding
              </span>
            </div>

            <ArrowRight size={15} />
          </Link>

          <Link to="#" className="practice-item">
            <BookOpen size={20} />

            <div>
              <strong>Reading</strong>
              <span>
                Build reading fluency and comprehension
              </span>
            </div>

            <ArrowRight size={15} />
          </Link>

          <Link to="#" className="practice-item">
            <PenLine size={20} />

            <div>
              <strong>Writing</strong>
              <span>
                Practice written expression
              </span>
            </div>

            <ArrowRight size={15} />
          </Link>
        </div>
      </section>

      <section className="workspace-section">
        <div className="workspace-heading">
          <p>LEARN</p>
          <h2>Build your foundation</h2>
        </div>

        <div className="learn-links">
          <Link
            to={`/languages/${language.id}/curriculum`}
          >
            <BookOpen size={17} />
            Curriculum
            <ArrowRight size={14} />
          </Link>

          <Link
            to={`/languages/${language.id}/vocabulary`}
          >
            Vocabulary
            <ArrowRight size={14} />
          </Link>

          <Link to="#">
            <Sparkles size={17} />
            Grammar
            <ArrowRight size={14} />
          </Link>

          <Link to="#">
            Flashcards
            <ArrowRight size={14} />
          </Link>
        </div>
      </section>

      <section className="workspace-section">
        <div className="workspace-heading">
          <p>ASSESSMENT</p>
          <h2>See what you've learned</h2>
        </div>

        <div className="assessment-links">
          <Link to="#">
            Quiz sheets
            <span>50 questions</span>
          </Link>

          <Link to="#">
            Speaking assessment
            <span>Overall performance</span>
          </Link>

          <Link to="#">
            Writing assessment
            <span>Expression & accuracy</span>
          </Link>
        </div>
      </section>
    </div>
  );
}

export default LanguageWorkspace;