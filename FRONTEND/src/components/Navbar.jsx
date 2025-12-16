import { Link } from "react-router-dom";
import ThemeToggle from "./ThemeToggle";

export default function Navbar() {
  return (
    <nav className="flex justify-between items-center px-8 py-4 glass">
      <h1 className="text-xl font-bold text-neon">SkillSwap</h1>
      <div className="flex gap-6">
        <Link to="/">Home</Link>
        <Link to="/dashboard">Dashboard</Link>
        <Link to="/profile">Profile</Link>
        <Link to="/match">Match</Link>
        <ThemeToggle />
      </div>
    </nav>
  );
}
