"use client";

import { Button } from "@/components/ui/button";
import { Laptop, Moon, Sun } from "lucide-react";
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

  return (
    <div className="relative inline-block text-left">
      <Button 
        variant="ghost" 
        size="sm"
        className="text-luxury-navy hover:text-luxury-gold hover:bg-luxury-gold/5"
        onClick={() => {
          if (theme === "light") setTheme("dark");
          else if (theme === "dark") setTheme("system");
          else setTheme("light");
        }}
      >
        {theme === "light" ? (
          <Sun
            key="light"
            size={ICON_SIZE}
            className="text-luxury-navy"
          />
        ) : theme === "dark" ? (
          <Moon
            key="dark"
            size={ICON_SIZE}
            className="text-luxury-navy"
          />
        ) : (
          <Laptop
            key="system"
            size={ICON_SIZE}
            className="text-luxury-navy"
          />
        )}
      </Button>
    </div>
  );
};

export { ThemeSwitcher };
