import { useState } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";

interface Story {
  id: number;
  user: {
    id: number;
    username: string;
    displayName: string;
    profilePicture: string;
  };
  imageUrl: string;
  createdAt: string;
}

interface StoriesProps {
  stories: Story[];
}

export default function Stories({ stories }: StoriesProps) {
  const { user } = useAuth();
  const [selectedStory, setSelectedStory] = useState<Story | null>(null);
  
  // Show story modal when clicked
  const openStoryModal = (story: Story) => {
    setSelectedStory(story);
    // Close the modal after 5 seconds
    setTimeout(() => {
      setSelectedStory(null);
    }, 5000);
  };

  return (
    <div className="bg-white rounded-lg shadow-sm p-4 mb-4">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-medium">Stories</h2>
        <a href="#" className="text-primary text-sm">See all</a>
      </div>
      <div className="flex space-x-2 overflow-x-auto pb-2">
        {/* Create story card */}
        <div className="flex-shrink-0 w-24 h-40 rounded-lg bg-gray-200 relative overflow-hidden cursor-pointer">
          <div className="absolute inset-0 bg-gradient-to-t from-primary/70 to-primary/40 flex items-center justify-center">
            <div className="h-10 w-10 rounded-full bg-white flex items-center justify-center">
              <Plus className="h-6 w-6 text-primary" />
            </div>
          </div>
          <div className="absolute bottom-2 left-2 right-2 text-center">
            <p className="text-white text-xs font-medium">Create Story</p>
          </div>
        </div>
        
        {/* Story cards */}
        {stories.map((story) => (
          <div 
            key={story.id}
            className="flex-shrink-0 w-24 h-40 rounded-lg bg-gray-200 relative overflow-hidden cursor-pointer"
            onClick={() => openStoryModal(story)}
          >
            <img src={story.imageUrl} alt="Story" className="w-full h-full object-cover" />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
            <div className="absolute top-2 left-2 h-6 w-6 rounded-full bg-primary border-2 border-white overflow-hidden">
              <Avatar className="h-full w-full">
                <AvatarImage src={story.user.profilePicture} alt={story.user.displayName} />
                <AvatarFallback className="bg-primary text-white">
                  {story.user.displayName.charAt(0)}
                </AvatarFallback>
              </Avatar>
            </div>
            <div className="absolute bottom-2 left-2 right-2">
              <p className="text-white text-xs font-medium">{story.user.displayName.split(' ')[0]}</p>
            </div>
          </div>
        ))}
      </div>
      
      {/* Story modal */}
      {selectedStory && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80" onClick={() => setSelectedStory(null)}>
          <div className="relative w-full max-w-xl max-h-screen p-2">
            <img 
              src={selectedStory.imageUrl} 
              alt="Story" 
              className="w-full h-auto max-h-[80vh] object-contain rounded-lg"
              onClick={(e) => e.stopPropagation()}
            />
            <div className="absolute top-4 left-4 flex items-center">
              <Avatar className="h-8 w-8 border-2 border-white">
                <AvatarImage src={selectedStory.user.profilePicture} alt={selectedStory.user.displayName} />
                <AvatarFallback className="bg-primary text-white">
                  {selectedStory.user.displayName.charAt(0)}
                </AvatarFallback>
              </Avatar>
              <div className="ml-2 text-white">
                <p className="font-medium text-sm">{selectedStory.user.displayName}</p>
              </div>
            </div>
            <Button 
              variant="ghost" 
              size="icon" 
              className="absolute top-4 right-4 text-white hover:bg-black/20"
              onClick={() => setSelectedStory(null)}
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="18" y1="6" x2="6" y2="18"></line>
                <line x1="6" y1="6" x2="18" y2="18"></line>
              </svg>
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
