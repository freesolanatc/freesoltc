"use client";

import { useSyncExternalStore } from "react";
import { Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";
import { Button } from "@/components/ui/button";

const emptySubscribe = () => () => {};

export function ThemeToggle() {
  const { resolvedTheme, setTheme } = useTheme();
  // Hydration-safe "are we on the client yet" check without setState-in-effect:
  // server snapshot is false, client snapshot is true, so React re-renders once mounted.
  const mounted = useSyncExternalStore(
    emptySubscribe,
    () => true,
    () => false
  );

  if (!mounted) {
    return <Button variant="ghost" size="icon" aria-label="Toggle theme" disabled />;
  }

  const isDark = resolvedTheme === "dark";

  return (
    <Button
      variant="ghost"
      size="icon"
      aria-label={isDark ? "Switch to light mode" : "Switch to dark mode"}
      onClick={() => setTheme(isDark ? "light" : "dark")}
    >
      {isDark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
    </Button>
  );
}
