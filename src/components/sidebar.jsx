import { NavLink } from "react-router-dom";
import {
  Home,
  Languages,
  CalendarDays,
  ChartNoAxesColumn,
  Settings,
} from "lucide-react";

function Sidebar() {
  return (
    <aside className="sidebar">
      <div className="brand">
        <div className="brand-icon">V</div>

        <div>
          <div className="brand-name">VerbaLynx</div>
          <div className="brand-tagline">
            Learn. Speak. Write.
          </div>
        </div>
      </div>

      <nav className="sidebar-nav">
        <p className="nav-label">MAIN</p>

        <NavLink to="/" className="nav-item">
          <Home size={18} />
          <span>Dashboard</span>
        </NavLink>

        <NavLink to="/languages" className="nav-item">
          <Languages size={18} />
          <span>My Languages</span>
        </NavLink>

        <NavLink to="/schedule" className="nav-item">
          <CalendarDays size={18} />
          <span>Schedule</span>
        </NavLink>

        <NavLink to="/progress" className="nav-item">
          <ChartNoAxesColumn size={18} />
          <span>Progress</span>
        </NavLink>
      </nav>

      <div className="sidebar-bottom">
        <NavLink to="/settings" className="nav-item">
          <Settings size={18} />
          <span>Settings</span>
        </NavLink>

        <div className="user-card">
          <div className="user-avatar">U</div>

          <div>
            <strong>Learner</strong>
            <span>My account</span>
          </div>
        </div>
      </div>
    </aside>
  );
}

export default Sidebar;