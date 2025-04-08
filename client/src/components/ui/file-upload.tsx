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
  };

  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };
  
  // This function attempts to access the camera in a way that works across devices
  const triggerCameraInput = () => {
    // Create a dynamic input element with webcam access attributes
    const input = document.createElement('input');
    input.type = 'file';
    
    // For best cross-platform compatibility:
    // - On mobile, 'image/*' + 'capture' attribute opens the camera directly
    // - On desktops, we need to include 'video/*' to hint at camera access
    input.accept = 'image/*, video/*';
    
    // On supported mobile browsers, this will prefer the camera
    // Note: In desktop browsers, this may not do anything special
    if (navigator.userAgent.match(/Android|iPhone|iPad|iPod/i)) {
      // Use environment (back) camera on mobile devices
      input.setAttribute('capture', 'environment');
    }
    
    input.onchange = (e) => {
      const target = e.target as HTMLInputElement;
      if (target.files && target.files[0]) {
        handleFileChange({target} as ChangeEvent<HTMLInputElement>);
      }
    };
    
    // Trigger the file selection dialog
    input.click();
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
          title="On desktop, this will open your file browser to select an image. On mobile devices, this will open your camera app."
        >
          <Camera className="h-4 w-4 mr-2" />
          {navigator.userAgent.match(/Android|iPhone|iPad|iPod/i) ? "Take Photo" : "Camera/Photo"}
        </Button>
        
        {/* File input for regular uploads */}
        <Input
          type="file"
          accept="image/*"
          ref={fileInputRef}
          onChange={handleFileChange}
          className="hidden"
        />
      </div>
      
      <div className="text-xs text-gray-500 mt-1 text-center">
        {navigator.userAgent.match(/Android|iPhone|iPad|iPod/i) 
          ? "Camera access requires permission from your device" 
          : "On desktop, both buttons open the file selector. On mobile, Camera opens your device camera."}
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