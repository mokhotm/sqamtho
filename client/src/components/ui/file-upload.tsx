import React, { useState, useRef, ChangeEvent } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Camera, Upload, X, Check } from "lucide-react";

interface FileUploadProps {
  onFileSelect: (fileData: string | null) => void;
  defaultValue?: string | undefined;
  className?: string;
}

export function FileUpload({ onFileSelect, defaultValue, className }: FileUploadProps) {
  const [preview, setPreview] = useState<string | null>(defaultValue || null);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    const reader = new FileReader();
    
    reader.onloadend = () => {
      const result = reader.result as string;
      setPreview(result);
      onFileSelect(result);
      setIsUploading(false);
    };
    
    reader.onerror = () => {
      console.error('Error reading file');
      setIsUploading(false);
    };
    
    reader.readAsDataURL(file);
  };

  const clearImage = () => {
    setPreview(null);
    onFileSelect(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
    if (cameraInputRef.current) cameraInputRef.current.value = '';
  };

  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };
  
  const triggerCameraInput = () => {
    // We use a different input specifically for camera capture
    cameraInputRef.current?.click();
  };

  return (
    <div className={`space-y-2 ${className}`}>
      <div className="flex space-x-2">
        <Button 
          type="button" 
          variant="outline" 
          onClick={triggerFileInput}
          className="flex-1"
        >
          <Upload className="h-4 w-4 mr-2" />
          Upload Image
        </Button>
        
        <Button 
          type="button" 
          variant="outline" 
          onClick={triggerCameraInput}
          className="flex-1"
        >
          <Camera className="h-4 w-4 mr-2" />
          Take Photo
        </Button>
        
        {/* File input for regular uploads */}
        <Input
          type="file"
          accept="image/*"
          ref={fileInputRef}
          onChange={handleFileChange}
          className="hidden"
        />
        
        {/* Dedicated camera input with 'capture' attribute set to 'environment' (back camera) */}
        <Input
          type="file"
          accept="image/*"
          capture="environment"
          ref={cameraInputRef}
          onChange={handleFileChange}
          className="hidden"
        />
      </div>
      
      {preview && (
        <div className="relative mt-4">
          <div className="relative border rounded-md overflow-hidden aspect-square w-32 h-32 mx-auto">
            <img 
              src={preview} 
              alt="Profile preview" 
              className="w-full h-full object-cover"
            />
            <button
              type="button"
              onClick={clearImage}
              className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1"
              aria-label="Remove image"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
          
          <div className="flex items-center justify-center mt-2 text-sm text-green-600">
            <Check className="h-4 w-4 mr-1" />
            Image selected
          </div>
        </div>
      )}
      
      {isUploading && (
        <div className="text-center text-sm text-gray-500">
          Processing image...
        </div>
      )}
    </div>
  );
}