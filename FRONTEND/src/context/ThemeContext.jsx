import { createContext, useState } from "react";

export const ThemeContext = createContext();

export default function ThemeProvider({ children }) {
  const [dark, setDark] = useState(true);
  return (
    <ThemeContext.Provider value={{ dark, setDark }}>
      <div className={dark ? "dark" : ""}>{children}</div>
    </ThemeContext.Provider>
  );
}
