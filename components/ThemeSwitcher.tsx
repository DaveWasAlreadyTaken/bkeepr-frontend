"use client";

import { useTheme } from "next-themes";
import { Button } from "@/components/ui/button";
import { Moon, Sun } from "lucide-react";
import { useHasHydrated } from "@/hooks/use-has-hydrated";

export function ThemeSwitcher() {
  const { resolvedTheme, setTheme } = useTheme();
  const hasHydrated = useHasHydrated();

  // Verhindert Hydration-Fehler, indem wir warten, bis die Komponente client-seitig gemounted ist
  if (!hasHydrated) {
    return null;
  }

  const toggleTheme = () => {
    setTheme(resolvedTheme === "dark" ? "light" : "dark");
  };

  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={toggleTheme}
      aria-label="Theme wechseln"
      tooltip={
        resolvedTheme === "dark"
          ? "Light Mode aktivieren"
          : "Dark Mode aktivieren"
      }
    >
      {resolvedTheme === "dark" ? (
        <Sun className="h-5 w-5" />
      ) : (
        <Moon className="h-5 w-5" />
      )}
    </Button>
  );
}
