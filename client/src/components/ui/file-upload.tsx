import React, { useState, useRef, useEffect, ChangeEvent } from "react";
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
  
  // Dynamic device detection that runs on client side
  const [isMobileDevice, setIsMobileDevice] = useState(false);
  
  // Check for mobile device when component mounts
  useEffect(() => {
    const checkMobile = () => {
      // More comprehensive mobile detection using regex patterns for mobile devices
      const userAgentIsMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
      const touchPointTest = "maxTouchPoints" in navigator && navigator.maxTouchPoints > 2;
      const mobileInUserAgent = /Mobi/i.test(navigator.userAgent);
      
      // Combine all detection methods
      setIsMobileDevice(userAgentIsMobile || (touchPointTest && mobileInUserAgent));
    };
    
    checkMobile();
    
    // Recheck if window resizes (might be a tablet switching orientation)
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

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
    
    if (isMobileDevice) {
      // On mobile devices: directly open the camera
      input.accept = 'image/*';
      input.setAttribute('capture', 'environment'); // Use back camera
      console.log('Opening camera on mobile device');
    } else {
      // On desktop/laptop: open file selection but prioritize images/video
      input.accept = 'image/*, video/*';
      console.log('Opening file selector on desktop/laptop');
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
          title={isMobileDevice 
            ? "Opens your device camera to take a photo" 
            : "Opens file browser to select an image file"
          }
        >
          <Camera className="h-4 w-4 mr-2" />
          {isMobileDevice ? "Take Photo" : "Camera/Photo"}
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
        {isMobileDevice 
          ? "Camera access requires permission from your device" 
          : "On desktop computers, both buttons open the file selector. Camera access is limited on desktop browsers."}
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