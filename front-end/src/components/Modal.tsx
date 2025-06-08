// src/components/Modal.tsx
import React from "react";

interface ModalProps {
  onClose: () => void;
  children: React.ReactNode;
}

export default function Modal({ onClose, children }: ModalProps) {
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div
        className="relative bg-white rounded-lg shadow-lg p-6 max-w-md w-full"
        onClick={(e) => e.stopPropagation()}
      >
        {/* ✕ close button */}
        <button
          onClick={onClose}
          className="absolute top-3 right-3 text-gray-600 hover:text-gray-900"
          aria-label="Close"
        >
          ✕
        </button>

        {children}
      </div>
    </div>
  );
}
