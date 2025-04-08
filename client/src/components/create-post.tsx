import { useState } from 'react';
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/use-auth";
import { Image, Smile, MapPin } from "lucide-react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

export default function CreatePost() {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [content, setContent] = useState("");
  const [image, setImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  // Create post mutation
  const createPostMutation = useMutation({
    mutationFn: async ({ content, imageUrl }: { content: string; imageUrl?: string }) => {
      const res = await apiRequest("POST", "/api/posts", { content, imageUrl });
      return await res.json();
    },
    onSuccess: () => {
      setContent("");
      setImage(null);
      setImagePreview(null);
      queryClient.invalidateQueries({ queryKey: ["/api/posts"] });
      toast({
        title: "Post created",
        description: "Your post has been published successfully",
      });
    },
    onError: (error) => {
      toast({
        title: "Failed to create post",
        description: "There was an error creating your post",
        variant: "destructive",
      });
    }
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (content.trim()) {
      createPostMutation.mutate({ 
        content, 
        imageUrl: imagePreview || undefined
      });
    }
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const selectedFile = e.target.files[0];
      setImage(selectedFile);
      
      // Create a preview URL for the image
      const reader = new FileReader();
      reader.onload = (e) => {
        if (e.target?.result) {
          setImagePreview(e.target.result as string);
        }
      };
      reader.readAsDataURL(selectedFile);
    }
  };

  const removeImage = () => {
    setImage(null);
    setImagePreview(null);
  };

  return (
    <div className="bg-white rounded-lg shadow-sm mb-4">
      <form onSubmit={handleSubmit} className="p-4">
        <div className="flex items-center space-x-2">
          <Avatar className="h-10 w-10 flex-shrink-0">
            <AvatarImage src={user?.profilePicture} alt={user?.displayName || user?.username} />
            <AvatarFallback className="bg-primary text-white">
              {user?.displayName?.charAt(0) || user?.username?.charAt(0)}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1">
            <input
              type="text"
              placeholder={`What's on your mind, ${user?.displayName?.split(' ')[0] || user?.username}?`}
              className="w-full px-4 py-2 bg-gray-100 rounded-full focus:outline-none focus:ring-2 focus:ring-primary"
              value={content}
              onChange={(e) => setContent(e.target.value)}
            />
          </div>
        </div>
        
        {/* Image preview */}
        {imagePreview && (
          <div className="mt-3 relative">
            <img src={imagePreview} alt="Preview" className="rounded-lg w-full max-h-80 object-contain" />
            <button
              type="button"
              className="absolute top-2 right-2 bg-white rounded-full p-1 shadow-sm"
              onClick={removeImage}
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="18" y1="6" x2="6" y2="18"></line>
                <line x1="6" y1="6" x2="18" y2="18"></line>
              </svg>
            </button>
          </div>
        )}
        
        <div className="flex mt-3 pt-3 border-t border-gray-200">
          <label className="flex items-center justify-center flex-1 p-2 text-gray-500 hover:bg-gray-50 rounded-lg cursor-pointer">
            <input
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleImageChange}
            />
            <Image className="h-5 w-5 text-secondary" />
            <span className="ml-2 text-sm">Photo/Video</span>
          </label>
          <button type="button" className="flex items-center justify-center flex-1 p-2 text-gray-500 hover:bg-gray-50 rounded-lg">
            <Smile className="h-5 w-5 text-primary" />
            <span className="ml-2 text-sm">Feeling</span>
          </button>
          <button type="button" className="flex items-center justify-center flex-1 p-2 text-gray-500 hover:bg-gray-50 rounded-lg">
            <MapPin className="h-5 w-5 text-accent" />
            <span className="ml-2 text-sm">Check in</span>
          </button>
        </div>
        
        {/* Submit button */}
        {(content.trim() || image) && (
          <div className="mt-3 flex justify-end">
            <Button
              type="submit"
              className="bg-primary hover:bg-primary/90 text-white"
              disabled={createPostMutation.isPending}
            >
              {createPostMutation.isPending ? "Posting..." : "Post"}
            </Button>
          </div>
        )}
      </form>
    </div>
  );
}
