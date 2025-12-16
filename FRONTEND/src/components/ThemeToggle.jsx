import { useTheme } from "../context/ThemeContext";

export default function ThemeToggle() {
  const { theme, toggleTheme } = useTheme();

  return (
    <button
      onClick={toggleTheme}
      className="relative w-14 h-8 rounded-full bg-gray-700 flex items-center px-1 transition"
    >
      <span
        className={`w-6 h-6 rounded-full bg-neon transition-all duration-300 ${
          theme === "dark" ? "translate-x-6" : "translate-x-0"
        }`}
      />
    </button>
  );
}
