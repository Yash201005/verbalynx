import { Link } from "react-router-dom";
import {
  ArrowRight,
  CalendarDays,
  Clock3,
} from "lucide-react";

import { languages } from "../data/languages";
import LanguageCard from "../components/LanguageCard";
import LynxMascot from "../components/LynxMascot";

function Dashboard() {
  return (
    <div className="dashboard">

      <section className="hero">
        <div className="hero-copy">
          <p className="eyebrow">
            YOUR LANGUAGE JOURNEY
          </p>

          <h1>
            Learn a language.
            <br />
            <em>Enter its world.</em>
          </h1>

          <p className="hero-description">
            VerbaLynx helps you build real language
            skills through speaking, listening, reading,
            writing and conversation.
          </p>

          <Link
            to="/languages"
            className="hero-button"
          >
            Explore my languages
            <ArrowRight size={16} />
          </Link>
        </div>

        <div className="hero-mascot">
          <div className="hero-sun" />
          <LynxMascot size="large" />
        </div>
      </section>

      <section className="languages-section">

        <div className="section-heading">
          <div>
            <p className="section-label">
              MY LANGUAGES
            </p>

            <h2>Your worlds</h2>
          </div>

          <Link
            to="/languages"
            className="text-link"
          >
            View all
            <ArrowRight size={14} />
          </Link>
        </div>

        <div className="language-grid">
          {languages.map((language) => (
            <LanguageCard
              key={language.id}
              language={language}
            />
          ))}
        </div>

      </section>

      <section className="today-section">

        <div className="section-heading">
          <div>
            <p className="section-label">
              TODAY
            </p>

            <h2>Continue where you left off</h2>
          </div>
        </div>

        <div className="continue-card">

          <div className="continue-illustration">
            🐈
          </div>

          <div className="continue-content">

            <div className="continue-top">
              <span>🇨🇳 Mandarin</span>
              <span>Lesson 8</span>
            </div>

            <h3>
              Ordering food
            </h3>

            <p>
              Practice listening and speaking
              in everyday situations.
            </p>

            <div className="lesson-progress">

              <div className="lesson-line">
                <div className="lesson-fill" />

                <span className="running-lynx">
                  🐈
                </span>
              </div>

              <span>58%</span>

            </div>

            <Link
              to="/languages/mandarin"
              className="continue-button"
            >
              Continue lesson
              <ArrowRight size={15} />
            </Link>

          </div>

        </div>

      </section>

      <section className="schedule-preview">

        <div>
          <p className="section-label">
            NEXT SESSION
          </p>

          <h2>Mandarin conversation</h2>

          <p>
            A short speaking session focused on
            everyday conversation.
          </p>
        </div>

        <div className="session-details">

          <span>
            <Clock3 size={15} />
            20 minutes
          </span>

          <span>
            <CalendarDays size={15} />
            Today · 7:00 PM
          </span>

        </div>

        <button className="session-button">
          Start session
          <ArrowRight size={15} />
        </button>

      </section>

    </div>
  );
}

export default Dashboard;