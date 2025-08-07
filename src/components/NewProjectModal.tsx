import React, { useState } from 'react';

interface NewProjectModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreate: (project: { name: string; description: string }) => void;
}

export const NewProjectModal: React.FC<NewProjectModalProps> = ({ isOpen, onClose, onCreate }) => {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');

  if (!isOpen) return null;

  const handleSubmit = () => {
    if (!name.trim()) return;
    onCreate({ name, description });
    setName('');
    setDescription('');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
      <div className="bg-white rounded-xl shadow-2xl p-6 w-full max-w-md">
        <h2 className="text-xl font-bold mb-4">Create Project</h2>
        <div className="mb-4">
          <input
            className="w-full rounded-lg border-gray-300 focus:ring-primary-500"
            placeholder="Project name"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
        </div>
        <div className="mb-4">
          <textarea
            className="w-full rounded-lg border-gray-300 focus:ring-primary-500"
            rows={3}
            placeholder="Description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
        </div>
        <div className="flex justify-end gap-2">
          <button
            className="px-4 py-2 rounded bg-gray-200 hover:bg-gray-300 text-gray-800"
            onClick={onClose}
          >
            Cancel
          </button>
          <button
            className="px-4 py-2 rounded bg-primary-500 hover:bg-primary-600 text-white font-semibold"
            onClick={handleSubmit}
          >
            Create
          </button>
        </div>
      </div>
    </div>
  );
};
