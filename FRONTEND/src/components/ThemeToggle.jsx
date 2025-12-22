import { useTheme } from "../context/ThemeContext";

export default function ThemeToggle() {
  const { theme, setTheme } = useTheme();

  return (
    <button
      onClick={() =>
        setTheme(theme === "dark" ? "light" : "dark")
      }
      
    >
      {theme === "dark" ? "Light Mode ☀️" : "Dark Mode 🌙"}
    </button>
  );
}
