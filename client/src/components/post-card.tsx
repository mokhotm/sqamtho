import { useState } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Heart, MessageCircle, Share2, Bookmark, MoreHorizontal } from "lucide-react";
import { format, formatDistanceToNow } from "date-fns";
import { useAuth } from "@/hooks/use-auth";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

interface Author {
  id: number;
  username: string;
  displayName: string;
  profilePicture: string;
}

interface Comment {
  id: number;
  content: string;
  createdAt: string;
  author: Author;
}

interface PostProps {
  id: number;
  content: string;
  imageUrl?: string;
  createdAt: string;
  author: Author;
  comments: Comment[];
  reactions: {
    count: number;
    types: Record<string, number>;
  };
}

export default function PostCard({ id, content, imageUrl, createdAt, author, comments, reactions }: PostProps) {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [newComment, setNewComment] = useState("");
  const [showAllComments, setShowAllComments] = useState(false);

  // Calculate if the post is liked by the current user
  const hasLiked = false; // This should be determined from the backend

  // Add comment mutation
  const addCommentMutation = useMutation({
    mutationFn: async (content: string) => {
      const res = await apiRequest("POST", `/api/posts/${id}/comments`, { content });
      return await res.json();
    },
    onSuccess: () => {
      setNewComment("");
      queryClient.invalidateQueries({ queryKey: ["/api/posts"] });
      toast({
        title: "Comment added",
        description: "Your comment has been added successfully",
      });
    },
    onError: (error) => {
      toast({
        title: "Failed to add comment",
        description: "There was an error adding your comment",
        variant: "destructive",
      });
    }
  });

  // Toggle like mutation
  const toggleLikeMutation = useMutation({
    mutationFn: async () => {
      if (hasLiked) {
        await apiRequest("DELETE", `/api/posts/${id}/reactions`);
      } else {
        await apiRequest("POST", `/api/posts/${id}/reactions`, { type: "like" });
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/posts"] });
    },
    onError: (error) => {
      toast({
        title: "Failed to update reaction",
        description: "There was an error updating your reaction",
        variant: "destructive",
      });
    }
  });

  const handleAddComment = (e: React.FormEvent) => {
    e.preventDefault();
    if (newComment.trim()) {
      addCommentMutation.mutate(newComment);
    }
  };

  const handleLike = () => {
    toggleLikeMutation.mutate();
  };

  const formattedDate = () => {
    const date = new Date(createdAt);
    const now = new Date();
    const isToday = date.toDateString() === now.toDateString();
    const isYesterday = new Date(now.setDate(now.getDate() - 1)).toDateString() === date.toDateString();
    
    if (isToday) {
      return `Today at ${format(date, 'h:mm a')}`;
    } else if (isYesterday) {
      return `Yesterday at ${format(date, 'h:mm a')}`;
    } else {
      return formatDistanceToNow(date, { addSuffix: true });
    }
  };

  const visibleComments = showAllComments ? comments : comments.slice(0, 2);

  return (
    <div className="bg-white rounded-lg shadow-sm mb-4">
      <div className="p-4">
        <div className="flex items-start">
          <Avatar className="h-10 w-10 flex-shrink-0">
            <AvatarImage src={author.profilePicture} alt={author.displayName} />
            <AvatarFallback className="bg-primary text-white">
              {author.displayName.charAt(0)}
            </AvatarFallback>
          </Avatar>
          <div className="ml-3 flex-1">
            <p className="font-medium">{author.displayName}</p>
            <p className="text-xs text-gray-500 flex items-center">
              <span>{formattedDate()}</span>
              <span className="mx-1">•</span>
              <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </p>
          </div>
          <button className="p-1 text-gray-500 rounded-full hover:bg-gray-100">
            <MoreHorizontal className="h-5 w-5" />
          </button>
        </div>
        <div className="mt-3">
          <p>{content}</p>
        </div>
        {imageUrl && (
          <div className="mt-3 rounded-lg overflow-hidden">
            <img src={imageUrl} alt="Post" className="w-full h-auto" />
          </div>
        )}
        <div className="flex items-center justify-between mt-3 pt-3 border-t border-gray-200">
          <div className="flex items-center">
            <Button
              variant="ghost"
              size="sm"
              className={`flex items-center ${hasLiked ? 'text-primary' : 'text-gray-500 hover:text-primary'}`}
              onClick={handleLike}
            >
              <Heart className={`h-5 w-5 ${hasLiked ? 'fill-current' : ''}`} />
              <span className="ml-1 text-sm">{reactions.count}</span>
            </Button>
            <Button variant="ghost" size="sm" className="flex items-center ml-4 text-gray-500 hover:text-primary">
              <MessageCircle className="h-5 w-5" />
              <span className="ml-1 text-sm">{comments.length}</span>
            </Button>
            <Button variant="ghost" size="sm" className="flex items-center ml-4 text-gray-500 hover:text-primary">
              <Share2 className="h-5 w-5" />
              <span className="ml-1 text-sm">Share</span>
            </Button>
          </div>
          <Button variant="ghost" size="sm" className="flex items-center text-gray-500 hover:text-primary">
            <Bookmark className="h-5 w-5" />
            <span className="ml-1 text-sm">Save</span>
          </Button>
        </div>
        
        {/* Comments Section */}
        {comments.length > 0 && (
          <div className="mt-4 pt-3 border-t border-gray-200">
            {visibleComments.map((comment) => (
              <div key={comment.id} className="flex items-start mb-3">
                <Avatar className="h-8 w-8 flex-shrink-0">
                  <AvatarImage src={comment.author.profilePicture} alt={comment.author.displayName} />
                  <AvatarFallback className="bg-gray-300">
                    {comment.author.displayName.charAt(0)}
                  </AvatarFallback>
                </Avatar>
                <div className="ml-2 flex-1 bg-gray-100 rounded-2xl px-3 py-2">
                  <p className="font-medium text-sm">{comment.author.displayName}</p>
                  <p className="text-sm">{comment.content}</p>
                </div>
              </div>
            ))}
            
            {comments.length > 2 && (
              <button 
                className="text-sm text-gray-500 hover:text-primary mb-3"
                onClick={() => setShowAllComments(!showAllComments)}
              >
                {showAllComments ? "Show fewer comments" : `View all ${comments.length} comments`}
              </button>
            )}
            
            <form onSubmit={handleAddComment} className="flex items-center">
              <Avatar className="h-8 w-8 flex-shrink-0">
                <AvatarImage src={user?.profilePicture} alt={user?.displayName || user?.username} />
                <AvatarFallback className="bg-primary text-white">
                  {user?.displayName?.charAt(0) || user?.username?.charAt(0)}
                </AvatarFallback>
              </Avatar>
              <div className="ml-2 flex-1">
                <input
                  type="text"
                  placeholder="Write a comment..."
                  className="w-full px-3 py-2 bg-gray-100 rounded-full focus:outline-none focus:ring-2 focus:ring-primary text-sm"
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                />
              </div>
              <Button
                type="submit"
                size="sm"
                variant="ghost"
                className="ml-2"
                disabled={!newComment.trim() || addCommentMutation.isPending}
              >
                Post
              </Button>
            </form>
          </div>
        )}
        
        {/* Empty comments section - just the form */}
        {comments.length === 0 && (
          <div className="mt-4 pt-3 border-t border-gray-200">
            <form onSubmit={handleAddComment} className="flex items-center">
              <Avatar className="h-8 w-8 flex-shrink-0">
                <AvatarImage src={user?.profilePicture} alt={user?.displayName || user?.username} />
                <AvatarFallback className="bg-primary text-white">
                  {user?.displayName?.charAt(0) || user?.username?.charAt(0)}
                </AvatarFallback>
              </Avatar>
              <div className="ml-2 flex-1">
                <input
                  type="text"
                  placeholder="Write a comment..."
                  className="w-full px-3 py-2 bg-gray-100 rounded-full focus:outline-none focus:ring-2 focus:ring-primary text-sm"
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                />
              </div>
              <Button
                type="submit"
                size="sm"
                variant="ghost"
                className="ml-2"
                disabled={!newComment.trim() || addCommentMutation.isPending}
              >
                Post
              </Button>
            </form>
          </div>
        )}
      </div>
    </div>
  );
}
