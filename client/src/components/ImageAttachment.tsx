import React, { useState, useRef, useEffect } from 'react';
import { X, Upload, AlertCircle } from 'lucide-react';

interface ImageAttachmentProps {
  isOpen: boolean;
  onClose: () => void;
  onImageAttached: (file: File) => void;
  attachedImage?: File | null;
  onImageRemoved?: () => void;
}

export function ImageAttachment({
  isOpen,
  onClose,
  onImageAttached,
  attachedImage,
  onImageRemoved
}: ImageAttachmentProps) {
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const modalRef = useRef<HTMLDivElement>(null);

  // Generate preview URL when image changes
  useEffect(() => {
    if (attachedImage) {
      const url = URL.createObjectURL(attachedImage);
      setPreviewUrl(url);
      return () => URL.revokeObjectURL(url);
    } else {
      setPreviewUrl(null);
    }
  }, [attachedImage]);

  // Close modal when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (modalRef.current && !modalRef.current.contains(event.target as Node)) {
        onClose();
      }
    }

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    } else {
      document.removeEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen, onClose]);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      onImageAttached(file);
    }
  };

  const handleDragOver = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
  };

  const handleDrop = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    const file = event.dataTransfer.files?.[0];
    if (file && file.type.startsWith('image/')) {
      onImageAttached(file);
    }
  };

  const handleRemoveImage = () => {
    if (onImageRemoved) {
      onImageRemoved();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay">
      <div 
        ref={modalRef}
        className="modal-content"
        aria-modal="true"
        role="dialog"
        aria-labelledby="image-attachment-title"
      >
        <div className="flex justify-between items-center mb-4">
          <h2 id="image-attachment-title" className="text-xl font-semibold">Attach Image</h2>
          <button 
            onClick={onClose}
            className="p-1 rounded-full hover:bg-muted"
            aria-label="Close"
          >
            <X size={18} />
          </button>
        </div>

        {/* Medical disclaimer */}
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
          <div className="flex">
            <AlertCircle className="h-5 w-5 text-amber-600 mr-2 flex-shrink-0" />
            <p className="text-sm text-amber-800">
              AI can analyze medical images, X-rays, documents, 
              and photos to provide insights. For emergencies, 
              seek immediate medical attention.
            </p>
          </div>
        </div>

        {/* Image upload area */}
        {!previewUrl ? (
          <div 
            className="border-2 border-dashed border-border rounded-lg p-8 text-center cursor-pointer hover:bg-muted/20 transition-colors"
            onClick={() => fileInputRef.current?.click()}
            onDragOver={handleDragOver}
            onDrop={handleDrop}
          >
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileChange}
              accept="image/*"
              className="hidden"
              aria-label="Upload image"
            />
            <div className="flex flex-col items-center">
              <Upload className="h-8 w-8 text-primary mb-2" />
              <h3 className="text-base font-medium mb-1">Upload image</h3>
              <p className="text-sm text-muted-foreground">Medical photos, X-rays, documents</p>
            </div>
          </div>
        ) : (
          <div className="image-attachment mb-6">
            <img src={previewUrl} alt="Attached medical image" className="max-h-64 mx-auto" />
            <button 
              onClick={handleRemoveImage} 
              className="p-1 rounded-full bg-destructive text-white"
              aria-label="Remove image"
            >
              <X size={16} />
            </button>
          </div>
        )}

        {/* Action buttons */}
        <div className="flex justify-end mt-6">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-lg bg-secondary text-secondary-foreground font-medium hover:bg-secondary/90 focus:outline-none focus:ring-2 focus:ring-primary/20"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}
