"use client";

import { Button } from "@/components/ui/button";
import { Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";
import { useEffect, useState } from "react";

const ThemeSwitcher = () => {
  const [mounted, setMounted] = useState(false);
  const { theme, setTheme } = useTheme();

  // useEffect only runs on the client, so now we can safely show the UI
  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return null;
  }

  const ICON_SIZE = 16;
  const isDark = theme === "dark";

  const toggleTheme = () => {
    setTheme(isDark ? "light" : "dark");
  };

  return (
    <Button variant="ghost" size={"sm"} onClick={toggleTheme}>
      {isDark ? (
        <Sun key="sun" size={ICON_SIZE} className={"text-muted-foreground"} />
      ) : (
        <Moon key="moon" size={ICON_SIZE} className={"text-muted-foreground"} />
      )}
    </Button>
  );
};

export { ThemeSwitcher };
