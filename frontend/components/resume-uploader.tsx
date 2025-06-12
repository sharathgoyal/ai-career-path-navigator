"use client";

import React, { useState } from "react";

const ResumeUploader = () => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [analyzed, setAnalyzed] = useState<any>(null);
  const [loadingPath, setLoadingPath] = useState(false);
  const [careerPlan, setCareerPlan] = useState<string | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.[0]) {
      setSelectedFile(e.target.files[0]);
    }
  };

  const handleUpload = async () => {
    if (!selectedFile) return;
    setUploading(true);
    setCareerPlan(null);

    const formData = new FormData();
    formData.append("resume", selectedFile);

    const res = await fetch("/api/upload-resume", {
      method: "POST",
      body: formData,
    });

    const data = await res.json();
    const extractedText = data?.extracted;

    // Extract skills from GPT result
    const skillSectionMatch = extractedText.match(
      /1\.\s*Top\s*10\s*skills:\s*([\s\S]*?)\n\s*2\./i
    );
    const skillSection = skillSectionMatch ? skillSectionMatch[1] : "";

    const skillLines = skillSection
      .split("\n")
      .map((line) => line.replace(/^\s*[-•]\s*/, "").trim())
      .filter(Boolean);

    // Convert comma-separated lines into flat list
    const extractedSkills = skillLines.flatMap((line) =>
      line.split(",").map((s) => s.trim())
    );

    setAnalyzed({ raw: extractedText, skills: extractedSkills });
    setUploading(false);
  };

  const handleGeneratePath = async () => {
    if (!analyzed?.skills?.length) return;
    setLoadingPath(true);

    const res = await fetch("/api/generate-career-path", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ skills: analyzed.skills }),
    });

    const data = await res.json();
    setCareerPlan(data.generatedPlan);
    setLoadingPath(false);
  };

  return (
    <div className="w-full max-w-2xl mx-auto p-6 bg-white rounded-xl shadow-md space-y-6">
      <h2 className="text-2xl font-semibold text-center">Upload Your Resume</h2>

      <input
        type="file"
        accept=".pdf"
        onChange={handleFileChange}
        className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4
                   file:rounded-full file:border-0 file:text-sm file:font-semibold
                   file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
      />

      <button
        onClick={handleUpload}
        disabled={uploading || !selectedFile}
        className="w-full py-2 px-4 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 disabled:opacity-50"
      >
        {uploading ? "Analyzing Resume..." : "Upload & Analyze"}
      </button>

      {analyzed && (
        <>
          <div className="bg-gray-100 p-4 rounded-md">
            <h3 className="font-semibold">Extracted Skills:</h3>
            <p>{analyzed.skills?.join(", ") || "None detected"}</p>
          </div>

          <button
            onClick={handleGeneratePath}
            disabled={loadingPath}
            className="w-full py-2 px-4 bg-green-600 text-white font-semibold rounded-lg hover:bg-green-700 disabled:opacity-50"
          >
            {loadingPath ? "Generating Career Path..." : "Generate Career Path"}
          </button>
        </>
      )}

      {careerPlan && (
        <div className="mt-6 bg-yellow-50 p-6 rounded-lg text-sm whitespace-pre-wrap font-mono">
          <h3 className="font-bold mb-2 text-lg text-yellow-800">
            🎯 AI-Powered Career Roadmap
          </h3>
          {careerPlan}
        </div>
      )}
    </div>
  );
};

export default ResumeUploader;
