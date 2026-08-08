function SkillProgress({ name, score }) {
  return (
    <div className="skill-progress">
      <div className="skill-header">
        <span>{name}</span>
        <strong>{score}%</strong>
      </div>

      <div className="skill-track">
        <div
          className="skill-fill"
          style={{ width: `${score}%` }}
        />
      </div>
    </div>
  );
}

export default SkillProgress;