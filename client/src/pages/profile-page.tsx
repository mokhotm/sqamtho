import { useState } from "react";
import { useAuth } from "@/hooks/use-auth";
import { useQuery } from "@tanstack/react-query";
import Layout from "@/components/layout";
import { Button } from "@/components/ui/button";
import { SouthAfricanPattern } from "@/components/ui/south-african-pattern";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { MapPin, Calendar, Users, Edit, Camera } from "lucide-react";
import PostCard from "@/components/post-card";
import { format } from "date-fns";
import { Loader2 } from "lucide-react";
import FamilyTree from "@/components/family-tree";

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

  // Mock family data - in a real app, this would come from an API
  const familyData = {
    id: user?.id || 1,
    name: user?.displayName || user?.username || "Current User",
    relationship: "You",
    profilePicture: user?.profilePicture || undefined,
    birthYear: 1990,
    children: [
      {
        id: 2,
        name: "Sarah Johnson",
        relationship: "Sister",
        birthYear: 1992
      },
      {
        id: 3,
        name: "Michael Johnson",
        relationship: "Brother",
        birthYear: 1988
      }
    ]
  };
  
  // Fetch user's posts
  const { data: posts = [], isLoading: postsLoading } = useQuery<Post[]>({
    queryKey: ["posts"],
    select: (data) => data.filter(post => post.author.id === user?.id),
  });
  
  // Fetch user's friends
  const { data: friends = [], isLoading: friendsLoading } = useQuery<any[]>({
    queryKey: ["friends"],
    select: (data) => data.filter(friend => friend.status === 'accepted'),
  });
  
  if (!user) return null;

  const userJoinDate = user.id 
    ? format(new Date(2023, 0, user.id % 12, 0, 0, 0), "MMMM yyyy") 
    : "January 2023";

  return (
    <Layout>
          {/* Profile Header */}
          <div className="max-w-6xl mx-auto bg-background">
            {/* Cover Image */}
            <div className="relative h-64 bg-gray-200 overflow-hidden rounded-lg">
              {user.coverImage ? (
                <img
                  src={user.coverImage}
                  alt="Cover"
                  className="w-full h-full object-cover"
                />
              ) : (
                <SouthAfricanPattern className="w-full h-full opacity-50" />
              )}
              <Button 
                className="absolute bottom-4 right-4 bg-white/80 hover:bg-white"
                variant="secondary"
              >
                <Camera className="h-4 w-4 mr-2" />
                Update Cover
              </Button>
            </div>
            
            {/* Profile Info */}
            <div className="px-4 md:px-6 pb-6 relative">
              <div className="flex flex-col md:flex-row md:items-end">
                <div className="flex-shrink-0 -mt-16 z-10">
                  <Avatar className="h-32 w-32 rounded-md border-4 border-white shadow-md">
                    <AvatarImage src={user.profilePicture || undefined} alt={user.displayName || user.username}  />
                    <AvatarFallback className="text-3xl bg-primary text-white rounded-md">
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
            <Tabs defaultValue="posts" value={activeTab} onValueChange={setActiveTab} className="w-full">
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
                  <TabsTrigger 
                    value="family" 
                    className="flex-1 py-3 rounded-none data-[state=active]:border-b-2 data-[state=active]:border-primary data-[state=active]:shadow-none"
                  >
                    Family
                  </TabsTrigger>
                </TabsList>
              </div>

              {/* Tab Content */}
              <div className="pb-6">
                <TabsContent value="posts">
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
            </TabsContent>

            <TabsContent value="photos">
              <div className="bg-white rounded-lg shadow-sm p-6">
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                  {/* Add photo grid here */}
                  <p className="col-span-full text-center text-gray-500">No photos uploaded yet.</p>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="friends">
              <div className="bg-white rounded-lg shadow-sm p-6">
                {friendsLoading ? (
                  <div className="flex justify-center py-8">
                    <Loader2 className="h-8 w-8 animate-spin text-primary" />
                  </div>
                ) : friends.length === 0 ? (
                  <div className="text-center">
                    <p className="text-gray-500">No friends added yet.</p>
                    <Button className="mt-4">Find Friends</Button>
                  </div>
                ) : (
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                    {friends.map((friend) => (
                      <div key={friend.id} className="flex flex-col items-center text-center">
                        <Avatar className="h-16 w-16 mb-2 rounded-md">
                          <AvatarImage src={friend.profilePicture} alt={friend.displayName}  />
                          <AvatarFallback className="rounded-md">{friend.displayName.charAt(0)}</AvatarFallback>
                        </Avatar>
                        <p className="font-medium text-sm">{friend.displayName}</p>
                        <p className="text-xs text-gray-500">@{friend.username}</p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </TabsContent>
            
            <TabsContent value="about">
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
            </TabsContent>

            <TabsContent value="family">
              <div className="bg-white rounded-lg shadow-sm p-6">
                <FamilyTree familyData={familyData} />
              </div>
                </TabsContent>
              </div>
            </Tabs>
          </div>
    </Layout>
  );
}
