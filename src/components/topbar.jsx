import { Flame } from "lucide-react";

function Topbar() {
  return (
    <header className="topbar">
      <div className="topbar-title">
        Language Learning Dashboard
      </div>

      <div className="topbar-actions">
        <div className="streak">
          <Flame size={16} />
          <span>7 day streak</span>
        </div>

        <div className="topbar-avatar">
          U
        </div>
      </div>
    </header>
  );
}

export default Topbar;