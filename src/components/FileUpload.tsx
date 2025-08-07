import React, { useRef, useState } from 'react';

export interface FileUploadProps {
  label?: string;
  onFilesSelected: (files: FileList) => void;
  accept?: string;
  multiple?: boolean;
}

export const FileUpload: React.FC<FileUploadProps> = ({
  label = 'Select Files',
  onFilesSelected,
  accept,
  multiple = false,
}) => {
  const inputRef = useRef<HTMLInputElement>(null);
  const [dragging, setDragging] = useState(false);
  const [fileNames, setFileNames] = useState<string[]>([]);

  const openFileDialog = () => {
    inputRef.current?.click();
  };

  const onChange: React.ChangeEventHandler<HTMLInputElement> = (e) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      onFilesSelected(files);
      setFileNames(Array.from(files).map((f) => f.name));
    }
  };

  const onDragOver: React.DragEventHandler<HTMLDivElement> = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragging(true);
  };

  const onDragLeave: React.DragEventHandler<HTMLDivElement> = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragging(false);
  };

  const onDrop: React.DragEventHandler<HTMLDivElement> = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      onFilesSelected(e.dataTransfer.files);
      setFileNames(Array.from(e.dataTransfer.files).map((f) => f.name));
    }
  };

  return (
    <div
      className={`border-2 border-dashed rounded-lg p-6 cursor-pointer text-center ${dragging ? 'bg-blue-50 border-blue-400' : 'border-gray-300'}`}
      onClick={openFileDialog}
      onDragOver={onDragOver}
      onDragLeave={onDragLeave}
      onDrop={onDrop}
    >
      <input
        ref={inputRef}
        type="file"
        accept={accept}
        multiple={multiple}
        className="hidden"
        onChange={onChange}
      />
      {fileNames.length > 0 ? (
        <div className="text-gray-700 space-y-1">
          {fileNames.map((name) => (
            <div key={name}>{name}</div>
          ))}
        </div>
      ) : (
        <div className="text-gray-500">Drag & drop files here or click to browse</div>
      )}
      {label && fileNames.length === 0 && (
        <div className="mt-2 text-sm text-gray-500">{label}</div>
      )}
    </div>
  );
};

