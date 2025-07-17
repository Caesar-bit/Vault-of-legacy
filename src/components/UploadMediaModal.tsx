import React, { useRef, useState } from 'react';

interface UploadMediaModalProps {
  isOpen: boolean;
  onClose: () => void;
  onUpload: (file: File) => void;
}

export const UploadMediaModal: React.FC<UploadMediaModalProps> = ({ isOpen, onClose, onUpload }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);

  if (!isOpen) return null;

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedFile(e.target.files[0]);
      setError(null);
    }
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) {
      setSelectedFile(file);
      setError(null);
    }
  };

  const handleUpload = () => {
    if (!selectedFile) {
      setError('Please select a file to upload.');
      return;
    }
    onUpload(selectedFile);
    setSelectedFile(null);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40" onDragOver={(e) => e.preventDefault()}>
      <div className="bg-white rounded-xl shadow-2xl p-6 w-full max-w-md" onDragOver={handleDragOver} onDragLeave={handleDragLeave} onDrop={handleDrop}>
        <h2 className="text-xl font-bold mb-4">Upload Media</h2>
        <div
          className={`mb-4 border-2 border-dashed rounded-lg p-6 text-center cursor-pointer ${isDragging ? 'border-primary-400 bg-primary-50' : 'border-gray-300'}`}
          onClick={() => fileInputRef.current?.click()}
        >
          {selectedFile ? (
            <span className="text-gray-700 font-medium">{selectedFile.name}</span>
          ) : (
            <span className="text-gray-500">Drag & drop a file here or click to select</span>
          )}
        </div>
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileChange}
          className="hidden"
        />
        {error && <div className="text-red-500 text-sm mb-2">{error}</div>}
        <div className="flex justify-end gap-2">
          <button
            className="px-4 py-2 rounded bg-gray-200 hover:bg-gray-300 text-gray-800"
            onClick={onClose}
          >
            Cancel
          </button>
          <button
            className="px-4 py-2 rounded bg-primary-500 hover:bg-primary-600 text-white font-semibold"
            onClick={handleUpload}
          >
            Upload
          </button>
        </div>
      </div>
    </div>
  );
};
