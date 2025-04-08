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
  
  // Use getUserMedia API to access camera on desktop
  const openDeviceCamera = () => {
    // Create a video element to receive the camera stream
    const video = document.createElement('video');
    const canvas = document.createElement('canvas');
    const modal = document.createElement('div');
    
    // Style the modal to cover the screen
    modal.style.position = 'fixed';
    modal.style.top = '0';
    modal.style.left = '0';
    modal.style.width = '100vw';
    modal.style.height = '100vh';
    modal.style.backgroundColor = 'rgba(0, 0, 0, 0.9)';
    modal.style.zIndex = '9999';
    modal.style.display = 'flex';
    modal.style.flexDirection = 'column';
    modal.style.alignItems = 'center';
    modal.style.justifyContent = 'center';
    modal.style.padding = '20px';
    
    // Add a header with instructions
    const header = document.createElement('div');
    header.style.color = 'white';
    header.style.marginBottom = '15px';
    header.style.textAlign = 'center';
    header.style.fontSize = '18px';
    header.style.fontWeight = 'bold';
    header.innerHTML = 'Camera Access <br><span style="font-size: 14px; font-weight: normal;">Click "Capture" when ready to take a photo</span>';
    modal.appendChild(header);
    
    // Style the video element
    video.style.maxWidth = '100%';
    video.style.maxHeight = '70vh';
    video.style.borderRadius = '8px';
    video.style.border = '2px solid white';
    video.autoplay = true;
    
    // Create controls
    const controls = document.createElement('div');
    controls.style.display = 'flex';
    controls.style.marginTop = '20px';
    controls.style.gap = '10px';
    
    // Capture button
    const captureBtn = document.createElement('button');
    captureBtn.textContent = 'Capture';
    captureBtn.style.padding = '10px 20px';
    captureBtn.style.backgroundColor = '#4CAF50';
    captureBtn.style.color = 'white';
    captureBtn.style.border = 'none';
    captureBtn.style.borderRadius = '4px';
    captureBtn.style.cursor = 'pointer';
    
    // Cancel button
    const cancelBtn = document.createElement('button');
    cancelBtn.textContent = 'Cancel';
    cancelBtn.style.padding = '10px 20px';
    cancelBtn.style.backgroundColor = '#EF5350';
    cancelBtn.style.color = 'white';
    cancelBtn.style.border = 'none';
    cancelBtn.style.borderRadius = '4px';
    cancelBtn.style.cursor = 'pointer';
    
    // Add buttons to controls
    controls.appendChild(captureBtn);
    controls.appendChild(cancelBtn);
    
    // Add elements to modal
    modal.appendChild(video);
    modal.appendChild(controls);
    
    // Add modal to body
    document.body.appendChild(modal);
    
    // Handle media stream
    navigator.mediaDevices.getUserMedia({ video: true })
      .then(stream => {
        video.srcObject = stream;
        
        // Capture button click handler
        captureBtn.onclick = () => {
          // Set canvas dimensions to match video
          canvas.width = video.videoWidth;
          canvas.height = video.videoHeight;
          
          // Draw the current video frame to the canvas
          canvas.getContext('2d')?.drawImage(video, 0, 0, canvas.width, canvas.height);
          
          // Convert to data URL
          const imageData = canvas.toDataURL('image/png');
          
          // Set as preview and update state
          setPreview(imageData);
          onFileSelect(imageData);
          
          // Clean up
          cleanup();
        };
        
        // Cancel button click handler
        cancelBtn.onclick = cleanup;
        
        function cleanup() {
          // Stop all tracks in the stream
          stream.getTracks().forEach(track => track.stop());
          
          // Remove modal
          document.body.removeChild(modal);
        }
      })
      .catch(err => {
        console.error('Error accessing camera:', err);
        document.body.removeChild(modal);
        
        // Show error message to user
        alert('Could not access camera. Please make sure camera permissions are enabled in your browser settings.');
        
        // Fall back to file input
        fallbackToFileInput();
      });
  };
  
  const fallbackToFileInput = () => {
    // Create a regular file input as fallback
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    
    input.onchange = (e) => {
      const target = e.target as HTMLInputElement;
      if (target.files && target.files[0]) {
        handleFileChange({target} as ChangeEvent<HTMLInputElement>);
      }
    };
    
    input.click();
  };
  
  // Main function to handle camera button click
  const triggerCameraInput = () => {
    if (isMobileDevice) {
      // On mobile devices: try to directly open the camera
      const input = document.createElement('input');
      input.type = 'file';
      input.accept = 'image/*';
      input.setAttribute('capture', 'environment');
      
      input.onchange = (e) => {
        const target = e.target as HTMLInputElement;
        if (target.files && target.files[0]) {
          handleFileChange({target} as ChangeEvent<HTMLInputElement>);
        }
      };
      
      input.click();
    } else {
      // On desktop: use our custom camera interface with getUserMedia
      openDeviceCamera();
    }
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
            : "Opens a live camera view directly in the browser"
          }
        >
          <Camera className="h-4 w-4 mr-2" />
          {isMobileDevice ? "Take Photo" : "Open Camera"}
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
          : "On Ubuntu/desktop, clicking 'Open Camera' will request browser permission to access your webcam"}
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