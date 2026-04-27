import React, { useState, useRef } from "react";
import { X, UploadCloud, Download, FileText, AlertCircle } from "lucide-react";
import Button from "./Button";
import { toast } from "react-toastify";
import { useImportGenericDataMutation } from "../../redux/api/apiSlice";

// Dictionary for Validation and Sample Files
const importConfigs = {
  products: {
    requiredHeaders: ["name", "sku", "quantity", "price"],
    sampleCsv:
      "name,sku,quantity,price,currency,category\nSample Bottle,AWB-1000,50,15.99,USD,Bottles",
  },
  orders: {
    requiredHeaders: ["orderId", "customerName", "totalAmount"],
    sampleCsv:
      "orderId,customerName,totalAmount,status\nORD-999,John Doe,150.00,Pending",
  },
};

// Friendly names for the error messages
const friendlyNames = {
  name: "Product Name",
  sku: "SKU",
  quantity: "Quantity",
  price: "Price",
  orderId: "Order ID",
  customerName: "Customer Name",
  totalAmount: "Total Amount",
};

const ImportModal = ({ isOpen, onClose, dataType }) => {
  const [importData, { isLoading }] = useImportGenericDataMutation();
  const [selectedFile, setSelectedFile] = useState(null);
  const [error, setError] = useState("");
  const fileInputRef = useRef(null);

  if (!isOpen) return null;

  const config = importConfigs[dataType];

  const handleDownloadSample = () => {
    const blob = new Blob([config.sampleCsv], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${dataType}_sample_template.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const handleFileChange = (e) => {
    setError("");
    const file = e.target.files[0];
    if (!file) return;

    if (file.type !== "text/csv" && !file.name.endsWith(".csv")) {
      setError(
        "System only accepts standard .csv files. Please check your file format.",
      );
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target.result;

      // 1. Split the file into lines and remove any completely blank lines
      const lines = text
        .split("\n")
        .map((line) => line.trim())
        .filter((line) => line !== "");

      // 2. Check if the file is completely empty (0 bytes / no text)
      if (lines.length === 0) {
        setError(
          "This file is completely empty. Please add your data and try again.",
        );
        setSelectedFile(null);
        e.target.value = null;
        return;
      }

      // 3. Header validation
      const firstLine = lines[0].toLowerCase();
      const missingHeaders = config.requiredHeaders.filter(
        (header) => !firstLine.includes(header.toLowerCase()),
      );

      if (missingHeaders.length > 0) {
        const missingFriendly = missingHeaders
          .map((h) => friendlyNames[h] || h)
          .join(", ");
        setError(
          `Your file is missing the following required fields: ${missingFriendly}. Please fix your CSV and try again.`,
        );
        setSelectedFile(null);
        e.target.value = null;
      }
      // 4. NEW: Check if the file ONLY has headers but no actual data below it
      else if (lines.length === 1) {
        setError(
          "Your file has headers, but no data rows. Please add your inventory data and try again.",
        );
        setSelectedFile(null);
        e.target.value = null;
      }
      // 5. Success! File has headers AND data.
      else {
        setSelectedFile(file);
      }
    };
    reader.readAsText(file);
  };

  const handleUpload = async () => {
    if (!selectedFile) return;

    const formData = new FormData();
    formData.append("file", selectedFile);

    try {
      await importData({ type: dataType, formData }).unwrap();
      toast.success(`${dataType} imported successfully!`);
      setSelectedFile(null);
      setError("");
      onClose();
    } catch (err) {
      // FIX 3: Capture the exact error from your Node.js backend
      const backendMessage =
        err?.data?.message ||
        err?.data?.error ||
        "A server error occurred during import.";
      setError(`Import Failed: ${backendMessage}`);
      setSelectedFile(null); // Remove the green file indicator since it failed
    }
  };

  // Safe close handler for the buttons
  const handleClose = () => {
    setSelectedFile(null);
    setError("");
    if (fileInputRef.current) fileInputRef.current.value = null; // Clear the hidden input
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 backdrop-blur-sm">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-md p-6 relative">
        {/* Close Button */}
        <button
          onClick={handleClose}
          className="absolute top-4 right-4 text-slate-400 hover:text-slate-700"
        >
          <X size={20} />
        </button>

        <h3 className="text-xl font-bold text-slate-800 mb-2 capitalize">
          Import {dataType}
        </h3>
        <p className="text-sm text-slate-500 mb-6">
          Upload a CSV file to bulk add or update your {dataType}.
        </p>

        {/* Download Sample Button */}
        <div className="mb-6 bg-blue-50 p-4 rounded-lg border border-blue-100 flex items-center justify-between">
          <div className="flex items-center gap-3 text-blue-700">
            <FileText size={20} />
            <span className="text-sm font-medium">
              Need the correct format?
            </span>
          </div>
          <button
            onClick={handleDownloadSample}
            className="text-sm font-bold text-blue-600 hover:text-blue-800 underline"
          >
            Download Sample
          </button>
        </div>

        {/* Hidden File Input */}
        <input
          type="file"
          accept=".csv"
          ref={fileInputRef}
          onChange={handleFileChange}
          className="hidden"
        />

        {/* Drag & Drop Area */}
        <div
          onClick={() => fileInputRef.current.click()}
          className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors ${
            error
              ? "border-red-300 bg-red-50"
              : selectedFile
                ? "border-green-300 bg-green-50"
                : "border-slate-300 hover:bg-slate-50"
          }`}
        >
          <UploadCloud
            size={32}
            className={`mx-auto mb-3 ${error ? "text-red-500" : selectedFile ? "text-green-500" : "text-slate-400"}`}
          />
          {selectedFile ? (
            <p
              className={`text-sm font-bold ${error ? "text-red-700" : "text-green-700"}`}
            >
              {selectedFile.name}
            </p>
          ) : (
            <p className="text-sm text-slate-600">
              <span className="font-bold text-blue-600">Click to browse</span>{" "}
              or drag and drop your CSV here.
            </p>
          )}
        </div>

        {/* Error Message Box */}
        {error && (
          <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-red-600 mt-0.5 flex-shrink-0" />
            <div>
              <h4 className="text-sm font-bold text-red-800">
                Validation Failed
              </h4>
              <p className="text-sm text-red-600 mt-1">{error}</p>
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="mt-6 flex justify-end gap-3">
          <Button variant="outline" onClick={handleClose} disabled={isLoading}>
            Cancel
          </Button>
          <Button
            variant="primary"
            onClick={handleUpload}
            disabled={!selectedFile || isLoading}
          >
            {isLoading ? "Uploading..." : "Confirm Upload"}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default ImportModal;
