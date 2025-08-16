import { useEffect } from "react";

export function useThemeClass(theme: "light" | "dark") {
  useEffect(() => {
    const el = document.documentElement;
    if (theme === "dark") el.classList.add("dark");
    else el.classList.remove("dark");
  }, [theme]);
}