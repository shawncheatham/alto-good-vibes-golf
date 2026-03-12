"use client";

import { useEffect } from "react";

interface SignUpModalProps {
  open: boolean;
  onClose: () => void;
}

export default function SignUpModal({ open, onClose }: SignUpModalProps) {
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape" && open) {
        onClose();
      }
    };

    document.addEventListener("keydown", handleEscape);
    return () => document.removeEventListener("keydown", handleEscape);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Overlay */}
      <div
        className="absolute inset-0 bg-black/70 backdrop-blur-sm"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Modal */}
      <div className="relative bg-white rounded-lg shadow-lg max-w-md w-full p-6 animate-in fade-in slide-in-from-bottom-4 duration-200">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-2xl font-display font-semibold text-gvg-gray-900">Sign Up</h2>
          <button
            onClick={onClose}
            className="text-gvg-gray-400 hover:text-gvg-gray-600 text-3xl leading-none transition-colors"
            aria-label="Close modal"
          >
            &times;
          </button>
        </div>
        <div className="text-gvg-gray-600">
          <p>Sign up flow coming soon...</p>
        </div>
      </div>
    </div>
  );
}
