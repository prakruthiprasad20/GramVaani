"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Moon, Sun, Globe } from "lucide-react";

export default function Navbar() {
  const router = useRouter();
  const [darkMode, setDarkMode] = useState(false);

  const toggleTheme = () => {
    setDarkMode(!darkMode);
    document.documentElement.classList.toggle("dark");
  };

  return (
    <nav className="fixed top-0 left-0 w-full bg-white/70 dark:bg-gray-900/70 backdrop-blur-md shadow-sm border-b border-gray-200 dark:border-gray-700 z-50">
      <div className="max-w-7xl mx-auto px-6 py-3 flex justify-between items-center">
        <h1
          onClick={() => router.push("/")}
          className="text-xl font-semibold text-gray-800 dark:text-white cursor-pointer hover:text-cyan-400 dark:hover:text-blue-400 transition"
        >
          GramVaani
        </h1>

        
      </div>
    </nav>
  );
}
