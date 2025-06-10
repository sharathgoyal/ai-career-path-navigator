"use client";

import { useState } from "react";
import ResumeUploader from "../../components/resume-uploader";

export default function Home() {
  const [darkMode, setDarkMode] = useState<boolean>(false);
  return (
    <main
      className={`min-h-screen ${
        darkMode ? `bg-black` : `bg-gray-50 text-black`
      }`}
    >
      <div className="flex justify-end p-4">
        <button
          onClick={() => setDarkMode(!darkMode)}
          className={`px-4 py-2 border rounded-md hover:bg-gray-200 dark:hover:bg-gray-800 ${
            darkMode ? `text-white` : ``
          }`}
        >
          {darkMode ? "Dark Mode" : "Light Mode"}
        </button>
      </div>
      <div className="min-h-screen flex items-center justify-center">
        <ResumeUploader />
      </div>
    </main>
  );
}
