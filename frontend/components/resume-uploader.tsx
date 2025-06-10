"use client";

import { useState } from "react";

const ResumeUploader: React.FC = () => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [response, setResponse] = useState<any>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.[0]) {
      setSelectedFile(e.target.files[0]);
    }
  };

  const handleUpload = async () => {
    if (!selectedFile) return;

    setUploading(true);
    const formData = new FormData();
    formData.append("resume", selectedFile);

    const res = await fetch("/api/upload-resume", {
      method: "POST",
      body: formData,
    });

    const data = await res.json();
    setResponse(data);
    setUploading(false);
  };

  return (
    <div className="w-full max-w-lg mx-auto p-6 bg-white rounded-2xl shadow-md space-y-6">
      <h2 className="text-2xl font-semibold text-center">Upload Your Resume</h2>
      <input
        type="file"
        accept=".pdf,.doc,.docx"
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
        {uploading ? "Uploading..." : "Upload & Analyze"}
      </button>

      {response && (
        <div className="mt-6 bg-gray-100 p-4 rounded-lg text-sm">
          <h3 className="font-semibold mb-2">Extracted Info:</h3>
          <pre className="whitespace-pre-wrap">
            {JSON.stringify(response, null, 2)}
          </pre>
        </div>
      )}
    </div>
  );
};

export default ResumeUploader;
