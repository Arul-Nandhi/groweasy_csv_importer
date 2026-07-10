"use client";

import { useState, useRef } from "react";
import Papa from "papaparse";

export default function UploadModal({ open, onClose, darkMode, onImport }) {
  const [file, setFile] = useState(null);
  const [previewData, setPreviewData] = useState([]);
  const [error, setError] = useState("");
  const [isDragging, setIsDragging] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const fileInputRef = useRef(null);

  if (!open) return null;

  // Handles parsing and validation of the selected CSV file
  const handleFile = (selectedFile) => {
    setError("");
    if (!selectedFile) return;

    // Check if file is CSV
    if (!selectedFile.name.toLowerCase().endsWith(".csv")) {
      setError("Please upload a valid CSV file (.csv format only).");
      return;
    }

    setFile(selectedFile);

    // Parse the CSV
    Papa.parse(selectedFile, {
      header: true,
      skipEmptyLines: true,
      complete: (results) => {
        if (results.data && results.data.length > 0) {
          setPreviewData(results.data);
        } else {
          setError("The selected CSV file appears to be empty.");
          setFile(null);
        }
      },
      error: (err) => {
        setError("Error parsing CSV file: " + err.message);
        setFile(null);
      }
    });
  };

  // Trigger file browser click
  const onBrowseClick = () => {
    fileInputRef.current?.click();
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFile(e.dataTransfer.files[0]);
    }
  };

  const handleReset = () => {
    setFile(null);
    setPreviewData([]);
    setError("");
    setIsProcessing(false);
  };

  const handleConfirmUpload = async () => {
    setIsProcessing(true);
    setError("");

    try {
      const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:5000";
      const response = await fetch(`${backendUrl}/api/import`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          fileName: file.name,
          fileData: previewData
        })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to process data on server.");
      }

      // Success! Pass leads and stats to parent, then close and reset
      onImport(data.leads || [], {
        totalRecords: previewData.length,
        importedCount: (data.leads || []).length
      });
      handleReset();
      onClose();
    } catch (err) {
      console.error(err);
      setError(err.message || "Failed to communicate with backend server.");
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center z-[100] transition-opacity duration-300">
      <div className={`rounded-3xl p-6 w-[90%] max-w-5xl shadow-2xl transition-all duration-300 transform scale-100 max-h-[90vh] overflow-y-auto ${
        darkMode 
          ? "bg-slate-900 border border-slate-800 text-white" 
          : "bg-white text-slate-800 border border-cyan-100"
      }`}>
        
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <div>
            <h2 className="text-2xl font-bold tracking-tight">
              {isProcessing ? "AI Mapping In Progress" : "Import Leads via CSV"}
            </h2>
            <p className={`text-xs mt-1 ${darkMode ? "text-slate-400" : "text-slate-500"}`}>
              {isProcessing ? "Google Gemini is standardizing headers and sanitizing numbers..." : "Upload a CSV file to bulk import leads into your system."}
            </p>
          </div>

          <button
            onClick={() => {
              handleReset();
              onClose();
            }}
            disabled={isProcessing}
            className={`p-2 rounded-xl transition ${
              darkMode ? "hover:bg-slate-800 text-slate-400 hover:text-white" : "hover:bg-cyan-50 text-cyan-700"
            } disabled:opacity-50`}
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="mb-4 p-4 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-rose-500 text-sm flex items-center gap-2">
            <svg className="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
            <span>{error}</span>
          </div>
        )}

        {/* Content Area */}
        {isProcessing && (
          /* Processing Spinner Screen */
          <div className="py-20 flex flex-col items-center justify-center gap-4 text-center">
            <div className="relative flex items-center justify-center">
              <div className="w-16 h-16 border-4 border-cyan-200 border-t-cyan-600 rounded-full animate-spin"></div>
              <div className="absolute w-8 h-8 bg-cyan-600/10 rounded-full animate-ping"></div>
            </div>
            <div className="mt-2">
              <p className="font-bold text-lg">AI Mapping In Progress...</p>
              <p className={`text-xs mt-1 max-w-md ${darkMode ? "text-slate-400" : "text-slate-500"}`}>
                Identifying column meaning, mapping fields, applying valid status constraints, and verifying contact details.
              </p>
            </div>
          </div>
        )}

        {!isProcessing && !file && (
          /* Drag & Drop Zone (Matching Screenshot 1) */
          <div className="space-y-6">
            <div
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              onClick={onBrowseClick}
              className={`border-2 border-dashed rounded-3xl p-12 text-center cursor-pointer transition-all duration-300 flex flex-col items-center justify-center gap-4 ${
                isDragging
                  ? darkMode
                    ? "border-cyan-400 bg-cyan-950/20"
                    : "border-cyan-600 bg-cyan-50/50"
                  : darkMode
                    ? "border-slate-700 bg-slate-800/20 hover:border-cyan-500/40 hover:bg-slate-800/40"
                    : "border-cyan-200 bg-cyan-50/10 hover:border-cyan-400 hover:bg-cyan-50/30"
              }`}
            >
              <input
                type="file"
                ref={fileInputRef}
                accept=".csv"
                onChange={(e) => handleFile(e.target.files?.[0])}
                className="hidden"
              />

              {/* Upload arrow cloud icon */}
              <div className={`p-4 rounded-2xl transition ${
                darkMode ? "bg-slate-800 text-cyan-400" : "bg-cyan-50 text-cyan-600"
              }`}>
                <svg className="w-12 h-12" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 16.5V9.75m0 0l3 3m-3-3l-3 3M6.75 19.5a4.5 4.5 0 01-1.41-8.775 5.25 5.25 0 0110.233-2.33 3 3 0 013.758 3.848A3.752 3.752 0 0118 19.5H6.75z" />
                </svg>
              </div>

              <div>
                <p className="text-lg font-bold">
                  Drop your CSV file here
                </p>
                <p className={`text-xs mt-1 ${darkMode ? "text-slate-400" : "text-slate-500"}`}>
                  or click to browse files
                </p>
              </div>

              <div className={`text-xs ${darkMode ? "text-slate-400" : "text-slate-500"}`}>
                Supported file: .csv (max 5MB)
              </div>

              <p className={`text-[10px] leading-relaxed max-w-xl mx-auto px-4 ${darkMode ? "text-slate-500" : "text-slate-400"}`}>
                Required headers: created_at, name, email, country_code, mobile_without_country_code, company, city, state, country, lead_owner, crm_status, crm_note. Template includes default + custom CRM fields to reduce upload errors.
              </p>
            </div>

            {/* Footer Buttons */}
            <div className="flex justify-end pt-2">
              <button
                disabled
                className="px-6 py-2.5 rounded-xl bg-slate-300 text-slate-500 font-semibold text-sm cursor-not-allowed opacity-50"
              >
                Confirm Import
              </button>
            </div>
          </div>
        )}

        {!isProcessing && file && (
          /* Preview Data Table (Raw CSV Preview - Matching Screenshot 2) */
          <div className="space-y-6">
            {/* Selected File Card */}
            <div className={`p-4 rounded-2xl flex items-center justify-between border ${
              darkMode ? "bg-slate-800/40 border-slate-700" : "bg-cyan-50/30 border-cyan-100"
            }`}>
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-xl bg-cyan-600 text-white shadow-sm">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m2.25 0H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
                  </svg>
                </div>
                <div>
                  <p className="font-bold text-sm">{file.name}</p>
                  <p className={`text-[10px] mt-0.5 ${darkMode ? "text-slate-400" : "text-slate-500"}`}>
                    {(file.size / 1024).toFixed(2)} KB
                  </p>
                </div>
              </div>
              <button
                onClick={handleReset}
                className={`p-1.5 rounded-lg transition hover:scale-105 ${
                  darkMode ? "hover:bg-slate-700 text-slate-400" : "hover:bg-cyan-100 text-cyan-700"
                }`}
              >
                <svg className="w-4.5 h-4.5" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Raw CSV preview table */}
            <div className={`overflow-auto max-h-[300px] border rounded-2xl ${
              darkMode ? "border-slate-800 bg-slate-950/20" : "border-cyan-100 bg-cyan-50/10"
            }`}>
              <table className="min-w-full border-collapse">
                <thead className={`sticky top-0 z-10 text-xs font-bold uppercase tracking-wider ${
                  darkMode ? "bg-slate-800 border-b border-slate-700" : "bg-cyan-100/90 border-b border-cyan-200"
                }`}>
                  <tr>
                    {previewData.length > 0 &&
                      Object.keys(previewData[0]).map((header) => (
                        <th
                          key={header}
                          className={`p-4 text-left font-bold ${
                            darkMode ? "text-slate-200" : "text-cyan-800"
                          }`}
                        >
                          {header}
                        </th>
                      ))}
                  </tr>
                </thead>

                <tbody className={`divide-y text-sm ${
                  darkMode ? "divide-slate-800" : "divide-cyan-50/40"
                }`}>
                  {previewData.slice(0, 10).map((row, index) => (
                    <tr
                      key={index}
                      className={`transition ${
                        darkMode 
                          ? "hover:bg-slate-800/40 text-slate-300" 
                          : "hover:bg-cyan-50/20 text-slate-700"
                      }`}
                    >
                      {Object.values(row).map((value, i) => (
                        <td key={i} className="p-4 whitespace-nowrap">
                          {value === "" || value === undefined ? (
                            <span className="text-xs italic opacity-35">null</span>
                          ) : (
                            String(value)
                          )}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Footer Buttons */}
            <div className="flex justify-end pt-2">
              <button
                onClick={handleConfirmUpload}
                className="px-6 py-2.5 rounded-xl bg-cyan-600 hover:bg-cyan-700 active:scale-[0.98] text-white font-semibold text-sm shadow-md transition-all cursor-pointer"
              >
                Confirm Import
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}