"use client";

import { Search, Bell, Moon, Sun } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useState } from "react";

export function Header() {
  const [darkMode, setDarkMode] = useState(true);

  return (
    <header className="sticky top-0 z-30 flex h-14 items-center gap-4 border-b border-neutral-800 bg-neutral-950/80 px-6 backdrop-blur-sm">
      <div className="relative flex-1 max-w-md">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-neutral-500" />
        <Input
          placeholder="Ara veya komut yaz... (⌘K)"
          className="pl-9 bg-neutral-900 border-neutral-800"
        />
      </div>

      <div className="ml-auto flex items-center gap-2">
        <Button variant="ghost" size="icon" className="relative">
          <Bell className="h-4 w-4" />
          <span className="absolute -right-0.5 -top-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-indigo-600 text-[10px] text-white">
            3
          </span>
        </Button>

        <Button
          variant="ghost"
          size="icon"
          onClick={() => setDarkMode(!darkMode)}
        >
          {darkMode ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
        </Button>

        <div className="ml-2 flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-indigo-600 text-xs font-medium text-white">
            DV
          </div>
          <div className="hidden sm:block">
            <p className="text-sm font-medium text-neutral-200">Developer</p>
            <p className="text-xs text-neutral-500">admin</p>
          </div>
        </div>
      </div>
    </header>
  );
}
