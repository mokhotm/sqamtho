import { useState } from "react";
import { useAuth } from "@/hooks/use-auth";
import { useQuery } from "@tanstack/react-query";
import Header from "@/components/header";
import MobileNavigation from "@/components/mobile-navigation";
import LeftSidebar from "@/components/left-sidebar";
import { Button } from "@/components/ui/button";
import { SouthAfricanPattern } from "@/components/ui/south-african-pattern";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { MapPin, Calendar, Users, Link2, Edit, Camera } from "lucide-react";
import PostCard from "@/components/post-card";
import { format } from "date-fns";
import { Loader2 } from "lucide-react";

interface Post {
  id: number;
  content: string;
  imageUrl?: string;
  createdAt: string;
  author: {
    id: number;
    username: string;
    displayName: string;
    profilePicture: string;
  };
  comments: {
    id: number;
    content: string;
    createdAt: string;
    author: {
      id: number;
      username: string;
      displayName: string;
      profilePicture: string;
    };
  }[];
  reactions: {
    count: number;
    types: Record<string, number>;
  };
}

export default function ProfilePage() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState("posts");
  
  // Fetch user's posts
  const { data: posts = [], isLoading: postsLoading } = useQuery<Post[]>({
    queryKey: ["/api/posts"],
    select: (data) => data.filter(post => post.author.id === user?.id),
  });
  
  // Fetch user's friends
  const { data: friends = [], isLoading: friendsLoading } = useQuery<any[]>({
    queryKey: ["/api/friends"],
    select: (data) => data.filter(friend => friend.status === 'accepted'),
  });
  
  if (!user) return null;

  const userJoinDate = user.id 
    ? format(new Date(2023, 0, user.id % 12, 0, 0, 0), "MMMM yyyy") 
    : "January 2023";

  return (
    <>
      <Header />
      <MobileNavigation />
      
      <main className="container mx-auto pt-20 pb-20 md:pt-24 md:pb-8 px-4 md:flex">
        <LeftSidebar />
        
        <div className="flex-1 w-full md:px-4 lg:w-3/5 mx-auto">
          {/* Profile Header */}
          <div className="bg-white rounded-lg shadow-sm overflow-hidden mb-4">
            {/* Cover Photo */}
            <div className="h-48 bg-gradient-to-r from-primary/30 to-accent/30 relative">
              <SouthAfricanPattern className="absolute bottom-0 left-0 right-0" />
              <Button
                variant="ghost"
                size="sm"
                className="absolute top-4 right-4 bg-white bg-opacity-80 hover:bg-opacity-100"
              >
                <Camera className="h-4 w-4 mr-2" />
                Update Cover
              </Button>
            </div>
            
            {/* Profile Info */}
            <div className="px-6 pb-6 relative">
              <div className="flex flex-col md:flex-row md:items-end">
                <div className="flex-shrink-0 -mt-16 z-10">
                  <Avatar className="h-32 w-32 border-4 border-white shadow-md">
                    <AvatarImage src={user.profilePicture} alt={user.displayName || user.username} />
                    <AvatarFallback className="text-3xl bg-primary text-white">
                      {user.displayName ? user.displayName.charAt(0) : user.username.charAt(0)}
                    </AvatarFallback>
                  </Avatar>
                </div>
                <div className="mt-4 md:mt-0 md:ml-4 flex-1">
                  <div className="flex flex-col md:flex-row md:items-center justify-between">
                    <div>
                      <h1 className="text-2xl font-bold">{user.displayName || user.username}</h1>
                      <p className="text-gray-500">@{user.username}</p>
                    </div>
                    <div className="mt-4 md:mt-0">
                      <Button className="flex items-center">
                        <Edit className="h-4 w-4 mr-2" />
                        Edit Profile
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Bio & Details */}
              <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="col-span-2">
                  {user.bio ? (
                    <p>{user.bio}</p>
                  ) : (
                    <p className="text-gray-500 italic">No bio yet. Tell people about yourself.</p>
                  )}
                </div>
                <div className="space-y-2">
                  {user.location && (
                    <div className="flex items-center text-sm text-gray-500">
                      <MapPin className="h-4 w-4 mr-2" />
                      <span>{user.location}</span>
                    </div>
                  )}
                  <div className="flex items-center text-sm text-gray-500">
                    <Calendar className="h-4 w-4 mr-2" />
                    <span>Joined {userJoinDate}</span>
                  </div>
                  <div className="flex items-center text-sm text-gray-500">
                    <Users className="h-4 w-4 mr-2" />
                    <span>{friends.length} Friends</span>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Profile Tabs */}
            <Tabs defaultValue="posts" value={activeTab} onValueChange={setActiveTab}>
              <div className="border-t border-gray-200">
                <TabsList className="flex w-full bg-transparent border-b border-gray-200">
                  <TabsTrigger 
                    value="posts" 
                    className="flex-1 py-3 rounded-none data-[state=active]:border-b-2 data-[state=active]:border-primary data-[state=active]:shadow-none"
                  >
                    Posts
                  </TabsTrigger>
                  <TabsTrigger 
                    value="photos" 
                    className="flex-1 py-3 rounded-none data-[state=active]:border-b-2 data-[state=active]:border-primary data-[state=active]:shadow-none"
                  >
                    Photos
                  </TabsTrigger>
                  <TabsTrigger 
                    value="friends" 
                    className="flex-1 py-3 rounded-none data-[state=active]:border-b-2 data-[state=active]:border-primary data-[state=active]:shadow-none"
                  >
                    Friends
                  </TabsTrigger>
                  <TabsTrigger 
                    value="about" 
                    className="flex-1 py-3 rounded-none data-[state=active]:border-b-2 data-[state=active]:border-primary data-[state=active]:shadow-none"
                  >
                    About
                  </TabsTrigger>
                </TabsList>
              </div>
            </Tabs>
          </div>
          
          {/* Tab Content */}
          <div className="pb-6">
            {/* Posts Tab */}
            {activeTab === "posts" && (
              <>
                {postsLoading ? (
                  <div className="flex justify-center py-8">
                    <Loader2 className="h-8 w-8 animate-spin text-primary" />
                  </div>
                ) : posts.length === 0 ? (
                  <div className="bg-white rounded-lg shadow-sm p-8 text-center">
                    <p className="text-gray-500">No posts yet. Share something with your friends!</p>
                    <Button className="mt-4">Create your first post</Button>
                  </div>
                ) : (
                  <>
                    {posts.map((post) => (
                      <PostCard 
                        key={post.id}
                        id={post.id}
                        content={post.content}
                        imageUrl={post.imageUrl}
                        createdAt={post.createdAt}
                        author={post.author}
                        comments={post.comments}
                        reactions={post.reactions}
                      />
                    ))}
                  </>
                )}
              </>
            )}
            
            {/* Photos Tab */}
            {activeTab === "photos" && (
              <div className="bg-white rounded-lg shadow-sm p-6">
                <h2 className="text-lg font-medium mb-4">Your Photos</h2>
                
                {posts.some(post => post.imageUrl) ? (
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    {posts
                      .filter(post => post.imageUrl)
                      .map((post) => (
                        <div key={post.id} className="aspect-square rounded-lg overflow-hidden">
                          <img 
                            src={post.imageUrl} 
                            alt="User upload"
                            className="w-full h-full object-cover"
                          />
                        </div>
                      ))
                    }
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <p className="text-gray-500">No photos yet. Share images in your posts!</p>
                  </div>
                )}
              </div>
            )}
            
            {/* Friends Tab */}
            {activeTab === "friends" && (
              <div className="bg-white rounded-lg shadow-sm p-6">
                <h2 className="text-lg font-medium mb-4">Your Friends</h2>
                
                {friendsLoading ? (
                  <div className="flex justify-center py-8">
                    <Loader2 className="h-8 w-8 animate-spin text-primary" />
                  </div>
                ) : friends.length === 0 ? (
                  <div className="text-center py-8">
                    <p className="text-gray-500">No friends yet. Connect with other users!</p>
                    <Button className="mt-4">Find Friends</Button>
                  </div>
                ) : (
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    {friends.map((friend) => (
                      <div key={friend.friend.id} className="p-4 border border-gray-200 rounded-lg flex flex-col items-center">
                        <Avatar className="h-16 w-16 mb-2">
                          <AvatarImage src={friend.friend.profilePicture} alt={friend.friend.displayName} />
                          <AvatarFallback className="bg-primary text-white">
                            {friend.friend.displayName.charAt(0)}
                          </AvatarFallback>
                        </Avatar>
                        <h3 className="font-medium text-center">{friend.friend.displayName}</h3>
                        <p className="text-xs text-gray-500">@{friend.friend.username}</p>
                        {friend.friend.isOnline && (
                          <span className="text-xs text-green-500 mt-1 flex items-center">
                            <span className="h-2 w-2 bg-green-500 rounded-full mr-1"></span>
                            Online
                          </span>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
            
            {/* About Tab */}
            {activeTab === "about" && (
              <div className="bg-white rounded-lg shadow-sm p-6">
                <h2 className="text-lg font-medium mb-4">About</h2>
                
                <div className="space-y-4">
                  <div>
                    <h3 className="text-sm font-medium text-gray-500">Bio</h3>
                    <p className="mt-1">{user.bio || "No bio added yet."}</p>
                  </div>
                  
                  <div>
                    <h3 className="text-sm font-medium text-gray-500">Location</h3>
                    <p className="mt-1">{user.location || "No location added yet."}</p>
                  </div>
                  
                  <div>
                    <h3 className="text-sm font-medium text-gray-500">Joined</h3>
                    <p className="mt-1">{userJoinDate}</p>
                  </div>
                  
                  <div className="pt-4 border-t border-gray-200">
                    <Button variant="outline" className="w-full sm:w-auto">
                      <Edit className="h-4 w-4 mr-2" />
                      Edit Profile Information
                    </Button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </main>
    </>
  );
}
